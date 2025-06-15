import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState("");
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    socket.on("camera-frame", (data) => {
      console.log("🖥️ Got frame on control panel");
      setImageSrc(data); // ✅ Frame received here
    });
  }, []);

  const toggleCamera = () => {
    const next = !cameraOn;
    socket.emit("toggle-camera", next);
    setCameraOn(next);
  };

  const sendMove = (dir) => {
    socket.emit("move-ball", dir);
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center space-y-4 p-6">
      <h1 className="text-3xl font-bold">💻 Control Panel</h1>

      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Live Feed"
          className="rounded-lg border w-full max-w-md shadow-lg"
        />
      ) : (
        <p className="text-gray-400">Waiting for camera feed...</p>
      )}

      <button
        onClick={toggleCamera}
        className={`px-6 py-2 rounded font-semibold ${
          cameraOn ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {cameraOn ? "🛑 Stop Camera" : "🎥 Start Camera"}
      </button>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <button onClick={() => sendMove("up")} className="col-start-2 bg-blue-600 px-4 py-2 rounded">⬆️</button>
        <button onClick={() => sendMove("left")} className="bg-blue-600 px-4 py-2 rounded">⬅️</button>
        <button onClick={() => sendMove("down")} className="col-start-2 bg-blue-600 px-4 py-2 rounded">⬇️</button>
        <button onClick={() => sendMove("right")} className="bg-blue-600 px-4 py-2 rounded">➡️</button>
      </div>
    </div>
  );
}
