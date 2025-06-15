import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const [ballPosition, setBallPosition] = useState({ x: 150, y: 150 });

  useEffect(() => {
    socket.on('ball-position', ({ x, y }) => {
      setBallPosition({ x, y });
    });
  }, []);

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center p-4 relative">
      <h1 className="text-2xl font-bold mb-4">📱 Mobile Ball View</h1>
      <div className="relative w-[300px] h-[300px] bg-gray-700 rounded-md shadow-md overflow-hidden">
        <div
          className="w-10 h-10 bg-blue-500 rounded-full absolute transition-all duration-200"
          style={{ top: `${ballPosition.y}px`, left: `${ballPosition.x}px` }}
        ></div>
      </div>
    </div>
  );
}
