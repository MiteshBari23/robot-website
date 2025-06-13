import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://your-backend-url.onrender.com"); // Replace with your actual backend URL

export default function CloudBallGame() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);

  // Movement handlers
  const moveBall = (direction) => {
    socket.emit("move", direction);
  };

  // Toggle camera
  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
    socket.emit("toggle-camera", !isCameraOn);
  };

  // Listen for camera stream (later replaced with WebRTC peer connection)
  useEffect(() => {
    socket.on("camera-stream", (streamData) => {
      // Handle streamed media (placeholder logic)
      console.log("Received camera stream data");
    });
  }, []);

  return (
    <div className="container text-center mt-5">
      <h2>🎮 Ball Controller</h2>
      <div className="d-flex justify-content-center gap-2 mb-3">
        <button className="btn btn-primary" onClick={() => moveBall("up")}>⬆️</button>
      </div>
      <div className="d-flex justify-content-center gap-2 mb-3">
        <button className="btn btn-primary" onClick={() => moveBall("left")}>⬅️</button>
        <button className="btn btn-primary" onClick={() => moveBall("down")}>⬇️</button>
        <button className="btn btn-primary" onClick={() => moveBall("right")}>➡️</button>
      </div>

      <button className="btn btn-success mb-4" onClick={toggleCamera}>
        {isCameraOn ? "🔴 Turn Off Camera" : "📷 Turn On Camera"}
      </button>

      <div>
        <h5>📺 Live Camera Feed:</h5>
        <video ref={videoRef} autoPlay playsInline width="320" height="240" style={{ border: "1px solid black" }}></video>
      </div>
    </div>
  );
}
