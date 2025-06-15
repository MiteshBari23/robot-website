import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const videoRef = useRef(null);
  const ballRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const step = 20;

    socket.on("move", ({ direction }) => {
      if (direction === "ArrowUp") y -= step;
      if (direction === "ArrowDown") y += step;
      if (direction === "ArrowLeft") x -= step;
      if (direction === "ArrowRight") x += step;
      const ball = ballRef.current;
      ball.style.left = `${x}px`;
      ball.style.top = `${y}px`;
    });

    socket.on("start-camera", () => {
      setCameraActive(true);
      startCamera();
    });

    socket.on("stop-camera", () => {
      setCameraActive(false);
      stopCamera();
    });
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      video.play();
      video.style.display = "block";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      intervalRef.current = setInterval(() => {
        if (!video.videoWidth) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const frame = canvas.toDataURL("image/jpeg", 0.5);
        socket.emit("camera-frame", frame);
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied.");
    }
  };

  const stopCamera = () => {
    clearInterval(intervalRef.current);
    const video = videoRef.current;
    video.pause();
    video.srcObject = null;
    video.style.display = "none";

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div style={{ background: "#222", height: "100vh", margin: 0 }}>
      <div
        ref={ballRef}
        id="ball"
        style={{
          width: "50px",
          height: "50px",
          background: "red",
          borderRadius: "50%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      ></div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        id="camera"
        style={{ display: "none", position: "fixed", bottom: 0, width: "100%" }}
      />
    </div>
  );
}
