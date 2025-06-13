import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as THREE from "three";

const socket = io("https://your-backend-url.onrender.com"); // Replace with your actual backend URL

export default function CloudBallGameMobile() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Setup Three.js scene for mobile ball rendering
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 320 / 240, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(320, 240);

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ball = new THREE.Mesh(geometry, material);
    scene.add(ball);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    // Handle ball movement from laptop
    socket.on("move", (direction) => {
      const step = 0.2;
      if (direction === "up") ball.position.y += step;
      if (direction === "down") ball.position.y -= step;
      if (direction === "left") ball.position.x -= step;
      if (direction === "right") ball.position.x += step;
    });

    // Handle camera toggle
    socket.on("toggle-camera", async (status) => {
      if (status && !streamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          const track = stream.getVideoTracks()[0];

          // Basic example: attach stream to hidden video
          videoRef.current.srcObject = stream;

          // You can implement WebRTC peer signaling here
          // e.g., send stream using peer connection
        } catch (err) {
          console.error("Camera access error:", err);
        }
      } else if (!status && streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(status);
    });
  }, []);

  return (
    <div className="container text-center mt-4">
      <h3>📱 Mobile Side - Ball + Camera</h3>
      <canvas ref={canvasRef} width={320} height={240} style={{ border: "1px solid black" }}></canvas>

      <div style={{ marginTop: "1rem" }}>
        <video ref={videoRef} autoPlay playsInline muted width="320" height="240" style={{ display: "none" }}></video>
      </div>
    </div>
  );
}
