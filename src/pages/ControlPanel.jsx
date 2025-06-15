import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState("");
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    socket.on("camera-frame", (data) => {
      setImageSrc(data);
    });
  }, []);

  const toggleCamera = () => {
    socket.emit("toggle-camera", !cameraOn);
    setCameraOn(!cameraOn);
  };

  const move = (direction) => {
    socket.emit("move-ball", direction);
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">💻 Control Panel</h1>

      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Live Feed"
          className="rounded-lg shadow-lg w-full max-w-md mb-4"
        />
      ) : (
        <p className="mb-4 text-gray-400">Waiting for camera feed...</p>
      )}

      <button
        onClick={toggleCamera}
        className={`px-4 py-2 rounded mb-4 ${
          cameraOn ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {cameraOn ? "🛑 Stop Camera" : "🎬 Start Camera"}
      </button>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => move("up")} className="col-start-2 bg-blue-600 p-2 rounded">⬆️</button>
        <button onClick={() => move("left")} className="bg-blue-600 p-2 rounded">⬅️</button>
        <button onClick={() => move("down")} className="col-start-2 bg-blue-600 p-2 rounded">⬇️</button>
        <button onClick={() => move("right")} className="bg-blue-600 p-2 rounded">➡️</button>
      </div>
    </div>
  );
}
