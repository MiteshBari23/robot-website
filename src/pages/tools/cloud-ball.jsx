import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://your-backend-url.onrender.com"); // Replace with your backend URL

export default function CloudBallGame() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // 📦 Movement Control (Laptop side)
  const moveBall = (direction) => {
    socket.emit("move", direction);
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  // 📱 Mobile: Send camera data
  useEffect(() => {
    if (isMobile && isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoRef.current.srcObject = stream;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            socket.emit("camera-data", e.data);
          }
        };

        mediaRecorder.start(100); // send every 100ms

        return () => {
          mediaRecorder.stop();
          stream.getTracks().forEach((track) => track.stop());
        };
      });
    } else if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isCameraOn]);

  // 🖥️ Laptop: Receive camera data
  useEffect(() => {
    if (!isMobile) {
      const recordedChunks = [];
      let mediaSource = new MediaSource();
      videoRef.current.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener("sourceopen", () => {
        const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');

        socket.on("camera-data", (chunk) => {
          recordedChunks.push(chunk);
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          videoRef.current.src = URL.createObjectURL(blob);
        });
      });
    }
  }, []);

  return (
    <div className="container text-center mt-5">
      <h2>🎮 Ball Controller</h2>

      {!isMobile && (
        <>
          <div className="d-flex justify-content-center gap-2 mb-3">
            <button className="btn btn-primary" onClick={() => moveBall("up")}>⬆️</button>
          </div>
          <div className="d-flex justify-content-center gap-2 mb-3">
            <button className="btn btn-primary" onClick={() => moveBall("left")}>⬅️</button>
            <button className="btn btn-primary" onClick={() => moveBall("down")}>⬇️</button>
            <button className="btn btn-primary" onClick={() => moveBall("right")}>➡️</button>
          </div>
        </>
      )}

      <button className="btn btn-success mb-4" onClick={toggleCamera}>
        {isCameraOn ? "🔴 Turn Off Camera" : "📷 Turn On Camera"}
      </button>

      <div>
        <h5>📺 {isMobile ? "Your Camera" : "Live Mobile Feed"}:</h5>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMobile}
          width="320"
          height="240"
          style={{ border: "1px solid black" }}
        />
      </div>
    </div>
  );
}
