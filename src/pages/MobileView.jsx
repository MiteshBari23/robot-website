import React from 'react';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './MobileView.css';

const SOCKET_URL = import.meta.env.PROD 
  ? 'https://website-and-cloudgame-2.onrender.com'
  : 'http://localhost:10000';

export default function MobileView() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const [accelerometer, setAccelerometer] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Handle camera control requests from laptop
    socketRef.current.on('toggleCamera', handleCameraToggle);

    // Request accelerometer permission and start listening
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      stopCamera();
      socketRef.current?.disconnect();
    };
  }, []);

  const handleMotion = (event) => {
    const x = event.accelerationIncludingGravity.x;
    const y = event.accelerationIncludingGravity.y;
    const z = event.accelerationIncludingGravity.z;

    setAccelerometer({ x, y, z });
    socketRef.current?.emit('ballMovement', { x, y, z });
  };

  const handleCameraToggle = async (enabled) => {
    if (enabled) {
      await startCamera();
    } else {
      stopCamera();
    }
    setIsCameraActive(enabled);
  };

  const startCamera = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        startStreaming();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      socketRef.current?.emit('cameraError', { message: err.message });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startStreaming = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    const sendFrame = () => {
      if (streamRef.current && video?.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Compress and send image data
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            socketRef.current?.emit('cameraStream', reader.result);
          };
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.5);
      }
      if (isCameraActive) {
        requestAnimationFrame(sendFrame);
      }
    };

    sendFrame();
  };

  return (
    <div className="mobile-view">
      <div className="status-bar">
        {isConnected ? 
          <span className="connected">Connected to Server</span> : 
          <span className="disconnected">Disconnected</span>
        }
      </div>

      <div className="sensor-data">
        <p>Accelerometer:</p>
        <p>X: {accelerometer.x?.toFixed(2)}</p>
        <p>Y: {accelerometer.y?.toFixed(2)}</p>
        <p>Z: {accelerometer.z?.toFixed(2)}</p>
      </div>

      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        style={{ display: 'none' }}
      />

      <div className="camera-status">
        Camera is {isCameraActive ? 'Active' : 'Inactive'}
      </div>

      <div className="instructions">
        Tilt your device to control the ball
      </div>
    </div>
  );
}