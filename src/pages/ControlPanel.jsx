import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState("");
  const [cameraOn, setCameraOn] = useState(false);

  const sendMove = (direction) => {
    socket.emit("move", { direction });
  };

  const toggleCamera = () => {
    if (cameraOn) {
      socket.emit("stop-camera");
    } else {
      socket.emit("start-camera");
    }
    setCameraOn(!cameraOn);
  };

  useEffect(() => {
    socket.on("camera-frame", (data) => {
      setImageSrc(data);
    });

    const handleKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        socket.emit("move", { direction: e.key });
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f4f4f4",
        height: "100vh",
        padding: "20px",
        textAlign: "center"
      }}
    >
      <h2>Control Ball with Arrow Keys or Buttons</h2>

      <div
        className="controls"
        style={{
          display: "grid",
          gridTemplateAreas: `". up ." "left . right" ". down ."`,
          gap: "10px",
          justifyContent: "center"
        }}
      >
        <button onClick={() => sendMove("ArrowUp")} style={{ gridArea: "up" }}>↑</button>
        <button onClick={() => sendMove("ArrowLeft")} style={{ gridArea: "left" }}>←</button>
        <button onClick={() => sendMove("ArrowRight")} style={{ gridArea: "right" }}>→</button>
        <button onClick={() => sendMove("ArrowDown")} style={{ gridArea: "down" }}>↓</button>
      </div>

      <br />
      <button onClick={toggleCamera} style={{ padding: "10px 20px", fontSize: "16px" }}>
        {cameraOn ? "🛑 Stop Camera" : "🎬 Start Camera"}
      </button>

      <br />
      <img
        id="liveFeed"
        src={imageSrc}
        alt="Camera Feed"
        style={{ maxWidth: "400px", marginTop: "20px" }}
      />
    </div>
  );
}
