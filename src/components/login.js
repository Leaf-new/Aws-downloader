// src/components/Login.js
import React, { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "",
  ClientId: "",
};
const userPool = new CognitoUserPool(poolData);

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [cognitoUserSession, setCognitoUserSession] = useState(null);

  const { Title } = Typography;

  const onFinish = async (values) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: values.username,
      Password: values.password,
    });

    setUsername(values.username);
    setPassword(values.password);

    const userData = {
      Username: values.username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        onLogin(result.getAccessToken().getJwtToken());
        message.success("Login exitoso!");
      },
      onFailure: (err) => {
        message.error(err.message);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        console.log("User Attributes:", userAttributes);
        console.log("Required Attributes:", requiredAttributes);
        setIsNewPasswordRequired(true);
        setCognitoUserSession(cognitoUser.Session);
        message.warning("Se requiere una nueva contraseña.");
      },
    });
  };

  const handleNewPasswordSubmit = () => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.Session = cognitoUserSession;

    cognitoUser.completeNewPasswordChallenge(
      newPassword,
      {},
      {
        onSuccess: (result) => {
          onLogin(result.getAccessToken().getJwtToken());
          message.success("Contraseña cambiada exitosamente!");
          setIsNewPasswordRequired(false);
        },
        onFailure: (err) => {
          message.error(err);
        },
      }
    );
  };

  return (
    <div style={{ maxWidth: "300px", margin: "0 auto", paddingTop: "50px" }}>
      <Title level={2}>Iniciar Sesion</Title>
      <Form name="login" onFinish={onFinish}>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Por favor ingrese su nombre de usuario!",
            },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nombre de Usuario" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Por favor ingrese su contraseña!" },
          ]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Contraseña"
          />
        </Form.Item>
        {isNewPasswordRequired && (
          <div>
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="primary" onClick={handleNewPasswordSubmit}>
              Confirmar Nueva Contraseña
            </Button>
          </div>
        )}
        <Form.Item>
          {!isNewPasswordRequired && (
            <Button type="primary" htmlType="submit" loading={loading} block>
              Iniciar Sesión
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
