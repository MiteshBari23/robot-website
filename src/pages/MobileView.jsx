import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCameraOn(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const sendFrames = () => {
        if (!videoRef.current || !cameraOn) return;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL('image/jpeg', 0.5);
        socket.emit('camera-frame', frame);
        if (cameraOn) requestAnimationFrame(sendFrames);
      };

      requestAnimationFrame(sendFrames);
    } catch (err) {
      console.error("❌ Camera access failed:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setCameraOn(false);
    }
  };

  useEffect(() => {
    const handleOrientation = (e) => {
      const direction = {
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma
      };
      socket.emit('orientation', direction);
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">📱 Mobile Control & Camera</h1>
      <div className="flex flex-col gap-4 items-center w-full max-w-md">
        <video ref={videoRef} autoPlay playsInline className="rounded shadow-md w-full" />
        <div className="flex gap-4">
          {!cameraOn ? (
            <button onClick={startCamera} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
              🎬 Start Camera
            </button>
          ) : (
            <button onClick={stopCamera} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
              🛑 Stop Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
