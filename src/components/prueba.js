// src/components/Download.js
import React, { useState } from "react";
import axios from "axios";

function Download({ token, onDownloadComplete }) {
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleDownload = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/download",
        { link },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setMessage("Video descargado exitosamente!");
      setVideoUrl(response.data.videoUrl);
      onDownloadComplete(); // Llama a la función de actualización del historial
    } catch (error) {
      setMessage("Error al descargar el video.");
      setVideoUrl("");
    }
  };

  return (
    <div>
      <h2>Descargar Video</h2>
      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Ingresa el enlace del video"
      />
      <button onClick={handleDownload}>Descargar</button>
      <p>{message}</p>
      {videoUrl && (
        <div>
          <h3>Video descargado:</h3>
          <a href={videoUrl} download target="_blank" rel="noopener noreferrer">
            Descargar Video
          </a>
        </div>
      )}
    </div>
  );
}

export default Download;
