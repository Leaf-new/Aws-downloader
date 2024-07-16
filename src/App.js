// src/App.js
import React, { useState, useEffect } from "react";
import Login from "./components/login";
import Download from "./components/download";
import DownloadHistory from "./components/downloadHistory";
import axios from "axios";
import "./App.css";
import { Typography, Space } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";

function App() {
  const [token, setToken] = useState("");
  const [history, setHistory] = useState([]);

  const { Title } = Typography;

  const handleLogin = (jwtToken) => {
    setToken(jwtToken);
    fetchHistory(jwtToken);
  };

  const fetchHistory = async (jwtToken) => {
    try {
      const response = await axios.get(
        "http://localhost:3001/download-history",
        {
          headers: {
            Authorization: jwtToken,
          },
        }
      );
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching download history", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory(token);
    }
  }, [token]);

  return (
    <div>
      <Space>
        <CloudDownloadOutlined style={{ fontSize: "32px", color: "#08c" }} />
        <Title level={1}>AWS Downloader</Title>
      </Space>
      {token ? (
        <>
          <Download
            token={token}
            onDownloadComplete={() => fetchHistory(token)}
          />
          <DownloadHistory history={history} />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
