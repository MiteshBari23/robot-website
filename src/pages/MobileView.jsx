import React, { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const ballRef = useRef(null);
  const videoRef = useRef(null);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    socket.on("move", ({ direction }) => {
      if (direction === "ArrowUp") y -= 20;
      if (direction === "ArrowDown") y += 20;
      if (direction === "ArrowLeft") x -= 20;
      if (direction === "ArrowRight") x += 20;
      const ball = ballRef.current;
      ball.style.left = `${x}px`;
      ball.style.top = `${y}px`;
    });

    socket.on("start-camera", async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      intervalRef.current = setInterval(() => {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const frame = canvas.toDataURL("image/jpeg", 0.5);
        socket.emit("camera-frame", frame);
      }, 200);
    });

    socket.on("stop-camera", () => {
      clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    });
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <video ref={videoRef} autoPlay muted playsInline className="absolute bottom-0 w-full h-40 object-cover" />
      <div
        ref={ballRef}
        className="absolute w-12 h-12 bg-red-600 rounded-full"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      ></div>
    </div>
  );
}
