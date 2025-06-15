import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const ballRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    console.log("📱 MobileView mounted");

    socket.on("move-ball", (dir) => {
      moveBall(dir);
    });

    socket.on("toggle-camera", (status) => {
      setCameraActive(status);
      if (status) startCamera();
    });
  }, []);

  const moveBall = (dir) => {
    const ball = ballRef.current;
    const top = parseInt(ball.style.top || "100", 10);
    const left = parseInt(ball.style.left || "100", 10);

    if (dir === "up") ball.style.top = `${top - 10}px`;
    if (dir === "down") ball.style.top = `${top + 10}px`;
    if (dir === "left") ball.style.left = `${left - 10}px`;
    if (dir === "right") ball.style.left = `${left + 10}px`;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const interval = setInterval(() => {
        if (!cameraActive) {
          clearInterval(interval);
          return;
        }

        canvas.width = 320;
        canvas.height = 240;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL("image/jpeg", 0.4);
        socket.emit("camera-frame", frame);
        console.log("📸 Frame sent");
      }, 200);
    } catch (err) {
      console.error("❌ Camera access failed:", err);
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", background: "#f0f0f0" }}>
      <h1 style={{ textAlign: "center" }}>📱 Mobile Ball + Camera View</h1>

      {/* Red Ball */}
      <div
        ref={ballRef}
        style={{
          width: 50,
          height: 50,
          background: "red",
          borderRadius: "50%",
          position: "absolute",
          top: "100px",
          left: "100px",
        }}
      />

      {/* Hidden Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: "none" }}
      />
    </div>
  );
}
