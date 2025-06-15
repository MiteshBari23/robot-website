import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        setInterval(() => {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frame = canvas.toDataURL('image/jpeg', 0.5);
          socket.emit('camera-frame', frame);
        }, 200);
      } catch (err) {
        console.error("❌ Camera access failed:", err);
      }
    }

    startCamera();
  }, []);

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">📱 Mobile Camera View</h1>
      <video ref={videoRef} autoPlay playsInline className="rounded-md shadow-md w-full max-w-md" />
    </div>
  );
}
