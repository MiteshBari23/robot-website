import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function ControlPanel() {
  const [imageSrc, setImageSrc] = useState('');
  const ballRef = useRef(null);
  const containerRef = useRef(null);
  const pos = useRef({ x: 100, y: 100 });

  useEffect(() => {
    socket.on('camera-frame', (data) => {
      setImageSrc(data);
    });

    socket.on('orientation', ({ beta, gamma }) => {
      if (!ballRef.current || !containerRef.current) return;

      const maxX = containerRef.current.offsetWidth - 50;
      const maxY = containerRef.current.offsetHeight - 50;

      pos.current.x += gamma / 2;
      pos.current.y += beta / 2;

      pos.current.x = Math.max(0, Math.min(maxX, pos.current.x));
      pos.current.y = Math.max(0, Math.min(maxY, pos.current.y));

      ballRef.current.style.left = `${pos.current.x}px`;
      ballRef.current.style.top = `${pos.current.y}px`;
    });
  }, []);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">💻 Control Panel + Live Feed</h1>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl items-center">
        <div className="bg-white rounded-lg p-2">
          {imageSrc ? (
            <img src={imageSrc} alt="Live Feed" className="rounded-md w-80 h-auto" />
          ) : (
            <p className="text-center text-gray-700 p-4">Waiting for camera feed...</p>
          )}
        </div>

        <div
          ref={containerRef}
          className="relative w-80 h-80 border-2 border-white rounded overflow-hidden bg-gray-800"
        >
          <div
            ref={ballRef}
            className="absolute w-12 h-12 bg-blue-500 rounded-full shadow-lg"
            style={{ top: '100px', left: '100px' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
