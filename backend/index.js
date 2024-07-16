// backend/index.js
const express = require("express");
const AWS = require("aws-sdk");
const youtubedl = require("youtube-dl-exec");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const path = require("path");
const cors = require("cors");
const {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} = require("amazon-cognito-identity-js");

// Configuración de AWS SDK
// AWS.config.update({
//   accessKeyId: "",
//   secretAccessKey: "",
//   region: "us-west-2",
// });
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de Cognito
const poolData = {
  UserPoolId: "us-west-2_VWdo56Jal",
  ClientId: "4868i2lm9ohprs8qp6c6j3huk7",
};
const userPool = new CognitoUserPool(poolData);

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided" });

  const params = {
    AccessToken: token,
  };

  const cognitoISP = new AWS.CognitoIdentityServiceProvider();
  cognitoISP.getUser(params, (err, data) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = data;
    next();
  });
};

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      res.json({ token: result.getAccessToken().getJwtToken() });
    },
    onFailure: (err) => {
      res.status(401).json({ message: err.message });
    },
  });
});

app.post("/download", authenticate, async (req, res) => {
  const { link } = req.body;
  const userId = req.user.Username;
  console.log("UserId", userId);

  try {
    const videoInfo = await youtubedl(link, { dumpSingleJson: true });

    const videoId = uuidv4();
    const videoPath = path.join(__dirname, "uploads", `${videoId}.mp4`);
    console.log(videoId);

    await fs.ensureDir(path.join(__dirname, "uploads"));

    // Descarga el video
    await youtubedl(link, {
      output: videoPath,
      format: "mp4",
    });

    // Lee el video descargado
    const videoData = await fs.readFile(videoPath);
    const s3Key = `${userId}/${videoId}.mp4`;

    // Guarda los metadatos en DynamoDB
    await DynamoDB.put({
      TableName: "Metadatos-yt",
      Item: {
        userID: userId,
        videoID: videoId,
        videoTitle: videoInfo.title,
        videoUrl: `https://video-yt-bucket.s3.amazonaws.com/${s3Key}`,
      },
    }).promise();

    // Sube el video a S3

    await S3.putObject({
      Bucket: "video-yt-bucket",
      Key: s3Key,
      Body: videoData,
      ContentDisposition: "attachment",
    }).promise();

    //Elimina el archivo temporalmente guardado
    await fs.remove(videoPath);

    const videoUrl = `https://video-yt-bucket.s3.amazonaws.com/${s3Key}`;

    res
      .status(200)
      .json({ message: "Video descargado exitosamente!", videoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al descargar el video." });
  }
});

// historial de descargas
app.get("/download-history", authenticate, async (req, res) => {
  const userId = req.user.Username;

  try {
    const params = {
      TableName: "Metadatos-yt",
      KeyConditionExpression: "userID = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    };

    const data = await DynamoDB.query(params).promise();
    res.status(200).json(data.Items);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener el historial de descargas." });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
