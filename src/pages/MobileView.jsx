import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    socket.on("toggle-camera", (status) => {
      console.log("🎥 Toggle:", status);
      setCameraActive(status);
      if (status) startCamera();
    });

    socket.on("move-ball", (dir) => moveBall(dir));
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      console.log("✅ Camera started");

      
      const sendFrame = () => {
        if (!cameraActive) return;
        canvas.width = 320;
        canvas.height = 240;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL("image/jpeg", 0.4);
        console.log("📤 Emitting frame...");
        socket.emit("camera-frame", frame); // ✅ Emit to server
        setTimeout(sendFrame, 200); // Repeat every 200ms
      };

      sendFrame();
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const moveBall = (dir) => {
    const ball = document.getElementById("ball");
    const top = parseInt(ball.style.top || "100");
    const left = parseInt(ball.style.left || "100");
    if (dir === "up") ball.style.top = `${top - 10}px`;
    if (dir === "down") ball.style.top = `${top + 10}px`;
    if (dir === "left") ball.style.left = `${left - 10}px`;
    if (dir === "right") ball.style.left = `${left + 10}px`;
  };

  return (
    <div className="bg-white h-screen relative">
      <h2 className="text-center font-semibold text-lg py-4">📱 Mobile View</h2>

      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      <div
        id="ball"
        style={{
          width: 50,
          height: 50,
          backgroundColor: "red",
          borderRadius: "50%",
          position: "absolute",
          top: "100px",
          left: "100px",
        }}
      ></div>
    </div>
  );
}
