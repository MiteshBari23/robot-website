import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const ballRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  let stream;

  useEffect(() => {
    socket.on("move-ball", (dir) => moveBall(dir));

    socket.on("toggle-camera", (state) => {
      if (state === "on") {
        setCameraOn(true);
        startCamera();
      } else {
        setCameraOn(false);
        stopCamera();
      }
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
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const sendFrames = () => {
        if (!cameraOn) return;

        canvas.width = 320;
        canvas.height = 240;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL("image/jpeg", 0.5);
        socket.emit("camera-frame", frame);

        setTimeout(sendFrames, 200);
      };

      sendFrames();
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="bg-white h-screen w-screen relative overflow-hidden">
      <h2 className="text-center text-xl font-semibold py-4 text-gray-800">📱 Mobile View</h2>

      <div
        ref={ballRef}
        className="absolute bg-red-500 rounded-full"
        style={{
          width: 50,
          height: 50,
          top: "100px",
          left: "100px",
        }}
      ></div>

      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
    </div>
  );
}
