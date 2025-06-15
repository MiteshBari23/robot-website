import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState("");
  const [cameraOn, setCameraOn] = useState(false);

  const move = (dir) => {
    socket.emit("move", { direction: dir });
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
        move(e.key);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center space-y-6 p-6">
      <h1 className="text-3xl font-bold">💻 Control Panel</h1>

      {imageSrc ? (
        <img src={imageSrc} alt="Camera Feed" className="rounded shadow max-w-md w-full" />
      ) : (
        <p className="text-gray-400">Waiting for feed...</p>
      )}

      <button
        onClick={toggleCamera}
        className={`px-6 py-2 rounded ${cameraOn ? "bg-red-600" : "bg-green-600"}`}
      >
        {cameraOn ? "🛑 Stop Camera" : "🎬 Start Camera"}
      </button>

      <div className="grid grid-cols-3 gap-2">
        <div></div>
        <button onClick={() => move("ArrowUp")} className="bg-blue-600 px-4 py-2 rounded">⬆️</button>
        <div></div>

        <button onClick={() => move("ArrowLeft")} className="bg-blue-600 px-4 py-2 rounded">⬅️</button>
        <button onClick={() => move("ArrowDown")} className="bg-blue-600 px-4 py-2 rounded">⬇️</button>
        <button onClick={() => move("ArrowRight")} className="bg-blue-600 px-4 py-2 rounded">➡️</button>
      </div>
    </div>
  );
}
