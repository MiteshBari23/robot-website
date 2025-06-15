import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState('');
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    socket.on('camera-frame', (data) => {
      setImageSrc(data);
    });
  }, []);

  const toggleCamera = () => {
    const newState = cameraOn ? 'off' : 'on';
    socket.emit('toggle-camera', newState);
    setCameraOn(!cameraOn);
  };

  const move = (direction) => {
    socket.emit('move', direction);
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">💻 Control Panel</h1>

      {imageSrc ? (
        <img src={imageSrc} alt="Live Feed" className="rounded-lg shadow-lg w-full max-w-lg mb-4" />
      ) : (
        <p>Waiting for camera feed...</p>
      )}

      <div className="flex gap-4 mb-4">
        <button onClick={toggleCamera} className={`px-4 py-2 rounded ${cameraOn ? 'bg-red-600' : 'bg-green-600'}`}>
          {cameraOn ? '🛑 Stop Camera' : '🎬 Start Camera'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => move('up')} className="col-start-2 px-4 py-2 bg-blue-500 rounded">⬆️</button>
        <button onClick={() => move('left')} className="col-start-1 px-4 py-2 bg-blue-500 rounded">⬅️</button>
        <button onClick={() => move('down')} className="col-start-2 px-4 py-2 bg-blue-500 rounded">⬇️</button>
        <button onClick={() => move('right')} className="col-start-3 px-4 py-2 bg-blue-500 rounded">➡️</button>
      </div>
    </div>
  );
}
