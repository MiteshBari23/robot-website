import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://robot-kl4k.onrender.com"); // Replace with your actual backend URL

export default function CloudBallGame() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const ballRef = useRef(null);
  const streamRef = useRef(null);
  const peerConnection = useRef(null);

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Ball position
  const position = useRef({ x: 150, y: 100 });

  useEffect(() => {
    const canvas = document.getElementById("ball-canvas");
    const ctx = canvas.getContext("2d");

    const drawBall = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(position.current.x, position.current.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = "green";
      ctx.fill();
      ctx.closePath();
    };

    drawBall();

    socket.on("move", (direction) => {
      const step = 10;
      if (direction === "up") position.current.y -= step;
      if (direction === "down") position.current.y += step;
      if (direction === "left") position.current.x -= step;
      if (direction === "right") position.current.x += step;
      drawBall();
    });

    socket.on("toggle-camera", async (status) => {
      if (status && !streamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
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

    // WebRTC handling
    socket.on("viewer-ready", async () => {
      peerConnection.current = new RTCPeerConnection(config);

      peerConnection.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", e.candidate);
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      stream.getTracks().forEach((track) =>
        peerConnection.current.addTrack(track, stream)
      );

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", offer);
    });

    socket.on("answer", async (answer) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(answer);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerConnection.current.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });
  }, []);

  return (
    <div className="container text-center mt-4">
      <h3>📱 Mobile Side - Ball + Camera</h3>
      <canvas
        id="ball-canvas"
        width={320}
        height={240}
        style={{ border: "1px solid black", backgroundColor: "#f0f0f0" }}
      ></canvas>

      <div style={{ marginTop: "1rem" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="320"
          height="240"
        ></video>
      </div>
    </div>
  );
}
