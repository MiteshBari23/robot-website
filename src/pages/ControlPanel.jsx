import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    socket.on('camera-frame', (data) => {
      setImageSrc(data);
    });
  }, []);

  return (
    <div className="bg-black text-white h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">💻 Control Panel</h1>
      {imageSrc ? (
        <img src={imageSrc} alt="Live Feed" className="rounded-lg shadow-lg w-full max-w-lg" />
      ) : (
        <p>Waiting for camera feed...</p>
      )}
    </div>
  );
}
