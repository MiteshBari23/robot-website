import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState("");
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    socket.on("camera-frame", (frame) => {
      setImageSrc(frame);
    });
  }, []);

  const toggleCamera = () => {
    const newState = cameraOn ? "off" : "on";
    socket.emit("toggle-camera", newState);
    setCameraOn(!cameraOn);
  };

  const move = (dir) => {
    socket.emit("move-ball", dir);
  };

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center p-4 space-y-6">
      <h1 className="text-3xl font-bold">💻 Control Panel</h1>

      <div className="w-full max-w-md">
        {imageSrc ? (
          <img src={imageSrc} alt="Live Feed" className="rounded-md shadow-md w-full" />
        ) : (
          <div className="text-gray-400 text-center">Waiting for camera feed...</div>
        )}
      </div>

      <button
        onClick={toggleCamera}
        className={`px-6 py-2 rounded-md text-white ${
          cameraOn ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {cameraOn ? "🛑 Stop Camera" : "🎬 Start Camera"}
      </button>

      <div className="grid grid-cols-3 gap-2 text-lg font-medium">
        <div></div>
        <button onClick={() => move("up")} className="bg-blue-600 px-4 py-2 rounded">⬆️</button>
        <div></div>

        <button onClick={() => move("left")} className="bg-blue-600 px-4 py-2 rounded">⬅️</button>
        <div></div>
        <button onClick={() => move("right")} className="bg-blue-600 px-4 py-2 rounded">➡️</button>

        <div></div>
        <button onClick={() => move("down")} className="bg-blue-600 px-4 py-2 rounded">⬇️</button>
        <div></div>
      </div>
    </div>
  );
}
