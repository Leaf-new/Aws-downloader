import React, { useState } from "react";
import { Form, Input, Button, Alert, message as Message } from "antd";
import axios from "axios";
import { Typography } from "antd";

function Download({ token, onDownloadComplete }) {
  const [link, setLink] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const { Title, Link } = Typography;

  const handleDownload = async () => {
    setLoading(true);
    setMensaje("");
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
      setMensaje("Video descargado exitosamente!");
      Message.success("Video descargado exitosamente!");
      setVideoUrl(response.data.videoUrl);
      onDownloadComplete(); // Llama a la función de actualización del historial
    } catch (error) {
      setMensaje("Error al descargar el video.");
      Message.error("Error al descargar el video.");
      setVideoUrl("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", paddingTop: "50px" }}>
      <Title level={2}>Descargar Video</Title>
      <Form>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Por favor ingrese el enlace del video!",
            },
          ]}
        >
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Ingresa el enlace del video"
          />
        </Form.Item>
        {mensaje && (
          <Alert
            message={mensaje}
            type={videoUrl ? "success" : "error"}
            showIcon
          />
        )}
        <Form.Item>
          <Button
            type="primary"
            onClick={handleDownload}
            loading={loading}
            block
          >
            Descargar
          </Button>
        </Form.Item>
      </Form>
      {videoUrl && (
        <div style={{ marginTop: "20px" }}>
          <Title level={3}>Video Descargado</Title>
          <Link
            href={videoUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Haz click aqui para descagar
          </Link>
        </div>
      )}
    </div>
  );
}

export default Download;
