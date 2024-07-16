// src/components/DownloadHistory.js
import React from "react";
import { List, Card, Typography } from "antd";

function DownloadHistory({ history }) {
  const { Title, Link } = Typography;
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "50px" }}>
      <Title level={2}>Historial de descargas</Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={history}
        renderItem={(item) => (
          <List.Item>
            <Card
              title={item.videoTitle}
              style={{
                backgroundColor: "#FDFEFE",
                borderBlockColor: "#17202A",
                borderInlineColor: "#17202A",
              }}
            >
              <p>
                <b>Enlace:</b>{" "}
                <Link
                  href={item.videoUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.videoTitle}
                </Link>
              </p>
              <p>
                <b>ID del video</b> {item.videoID}
              </p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default DownloadHistory;
