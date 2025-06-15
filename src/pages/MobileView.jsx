import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ballRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    socket.on("move", ({ direction }) => {
      const step = 20;
      if (direction === "ArrowUp") y -= step;
      if (direction === "ArrowDown") y += step;
      if (direction === "ArrowLeft") x -= step;
      if (direction === "ArrowRight") x += step;
      const ball = ballRef.current;
      ball.style.left = `${x}px`;
      ball.style.top = `${y}px`;
    });

    socket.on("start-camera", startCamera);
    socket.on("stop-camera", stopCamera);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      videoRef.current.style.display = "block";

      const ctx = canvasRef.current.getContext("2d");
      intervalRef.current = setInterval(() => {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const frame = canvasRef.current.toDataURL("image/jpeg", 0.5);
        socket.emit("camera-frame", frame);
      }, 200);
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const stopCamera = () => {
    clearInterval(intervalRef.current);
    videoRef.current.pause();
    videoRef.current.srcObject = null;
    videoRef.current.style.display = "none";
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <h2 className="text-white text-center text-xl py-4">📱 Mobile View</h2>
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <div
        ref={ballRef}
        className="absolute w-12 h-12 bg-red-600 rounded-full"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      ></div>
    </div>
  );
}
