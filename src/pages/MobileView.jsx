import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://website-and-cloudgame-2.onrender.com");

export default function MobileView() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    socket.on('toggle-camera', async (state) => {
      if (state === 'on') {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setCameraOn(true);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const interval = setInterval(() => {
            if (!cameraOn) return;
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const frame = canvas.toDataURL('image/jpeg', 0.5);
            socket.emit('camera-frame', frame);
          }, 200);

          return () => clearInterval(interval);
        } catch (err) {
          console.error("❌ Camera access failed:", err);
        }
      } else if (state === 'off') {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setCameraOn(false);
        videoRef.current.srcObject = null;
      }
    });
  }, [cameraOn, stream]);

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">📱 Mobile Camera View</h1>
      <video ref={videoRef} autoPlay playsInline className="rounded-md shadow-md w-full max-w-md" />
    </div>
  );
}
