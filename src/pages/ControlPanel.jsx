import React, { useEffect, useState } from "react";
import io from "socket.io-client";


const backendURL =
  import.meta.env.PROD
    ? "https://website-and-cloudgame.onrender.com" // ✅ use this after deployment
    : "http://localhost:5000"; // ✅ use this for local development

const socket = io(backendURL);


const ControlPanel = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    socket.on("camera-frame", (frame) => {
      console.log("📸 Received frame");
      setImageSrc(frame);
    });

    return () => {
      socket.off("camera-frame");
    };
  }, []);

  const toggleCamera = () => {
    socket.emit("toggle-camera", !cameraOn);
    setCameraOn(!cameraOn);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Control Panel</h2>
      <button onClick={toggleCamera}>
        {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>

      <div style={{ marginTop: "20px" }}>
        {imageSrc ? (
          <img src={imageSrc} alt="Mobile Feed" width="300" />
        ) : (
          <p>No camera feed yet</p>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => socket.emit("move-ball", "up")}>⬆️</button>
        <button onClick={() => socket.emit("move-ball", "left")}>⬅️</button>
        <button onClick={() => socket.emit("move-ball", "right")}>➡️</button>
        <button onClick={() => socket.emit("move-ball", "down")}>⬇️</button>
      </div>
    </div>
  );
};

export default ControlPanel;
