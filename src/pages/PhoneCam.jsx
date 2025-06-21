import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoader from "urdf-loader";
import * as THREE from "three";
import { io } from "socket.io-client";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
const NODE_SERVER_URL = "https://website-and-cloudgame-2.onrender.com";
const PHONE_DEVICE_ID = `phone-${Math.random().toString(36).substring(7)}`;
let robotInstance = null;

function URDFRobot() {
  const robotRef = useRef();

  useEffect(() => {
    if (robotRef.current?.children?.length > 0) return;
    if (robotInstance) {
      robotRef.current.add(robotInstance);
      return;
    }

    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    loader.packages = "/model/";

    loader.load(
      "/model/jaxon_jvrc.urdf",
      (robot) => {
        robot.rotation.set(-Math.PI / 2, 0, Math.PI);
        robotRef.current.add(robot);
        robotInstance = robot;
        window.robot = robot;
      },

      undefined,
      (err) => console.error("❌ Failed to load URDF", err)
    );
  }, []);

  return <group ref={robotRef} />;
}

export default function PhoneCam() {
  const peerConnection = useRef(null);
  const socket = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Connecting...");
  const [lastPose, setLastPose] = useState(null);

  useEffect(() => {
    socket.current = io(NODE_SERVER_URL);
    window.socket = socket.current;

    socket.current.on("connect", () => {
      setStatus("✅ Connected. Registering phone...");
      socket.current.emit("register_phone", PHONE_DEVICE_ID);
    });

    socket.current.on("pose-change", (pose) => {
      console.log("📥 Received pose from laptop:", pose);
      applyPoseToRobot(pose);
    });

    socket.current.on(
      "start_webrtc_offer",
      async ({ requestingLaptopSocketId }) => {
        setStatus("📡 Laptop requested stream...");
        await setupPeerConnection(requestingLaptopSocketId);
      }
    );

    socket.current.on("sdp_answer_from_laptop", async (sdpAnswer) => {
      if (peerConnection.current && !peerConnection.current.remoteDescription) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(sdpAnswer)
        );
        setStatus("✅ WebRTC connected.");
      }
    });

    socket.current.on("ice_candidate_from_laptop", async (candidate) => {
      if (peerConnection.current && candidate) {
        await peerConnection.current.addIceCandidate(candidate);
      }
    });

    const applyPoseToRobot = (pose) => {
      const robot = window.robot;
      if (!robot) return;

      const set = (j, v) => robot.joints[j]?.setJointValue(v);

      switch (pose) {
        case "legs-forward":
          set("LLEG_JOINT2", 0.5);
          set("RLEG_JOINT2", 0.5);
          break;
        case "legs-back":
          set("LLEG_JOINT2", -0.5);
          set("RLEG_JOINT2", -0.5);
          break;
        case "sit":
          set("LLEG_JOINT2", -0.7);
          set("LLEG_JOINT3", 1.2);
          set("RLEG_JOINT2", -0.7);
          set("RLEG_JOINT3", 1.2);
          break;
        case "stand":
          for (let i = 0; i <= 5; i++) {
            set(`LLEG_JOINT${i}`, 0);
            set(`RLEG_JOINT${i}`, 0);
          }
          break;
        case "head-rotate":
          set("HEAD_JOINT0", 0.5);
          break;
        case "chest-bend":
          set("CHEST_JOINT1", 0.4);
          break;
        case "larm-up":
          set("LARM_JOINT1", -0.6);
          break;
        case "larm-down":
          set("LARM_JOINT1", 0.6);
          break;
        case "rarm-up":
          set("RARM_JOINT1", -0.6);
          break;
        case "rarm-down":
          set("RARM_JOINT1", 0.6);
          break;
        case "reset":
          Object.keys(robot.joints).forEach((jointName) => {
            robot.joints[jointName].setJointValue(0);
          });
          break;
        default:
          break;
      }
    };

    const startCameraWithMediaPipe = async () => {
      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.7,
      });

      let gestureHistory = [];
      let lastGestureTime = 0;

      hands.onResults((results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        if (
          results.multiHandLandmarks &&
          results.multiHandLandmarks.length > 0
        ) {
          const hand = results.multiHandLandmarks[0];

          for (let landmark of hand) {
            ctx.beginPath();
            ctx.arc(
              landmark.x * canvas.width,
              landmark.y * canvas.height,
              4,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = "red";
            ctx.fill();
          }

          const indexTip = hand[8],
            indexPip = hand[6],
            middleTip = hand[12],
            middlePip = hand[10],
            ringTip = hand[16],
            ringPip = hand[14],
            pinkyTip = hand[20],
            pinkyPip = hand[18];

          const indexUp = indexTip.y < indexPip.y;
          const middleDown = middleTip.y > middlePip.y;
          const ringDown = ringTip.y > ringPip.y;
          const pinkyDown = pinkyTip.y > pinkyPip.y;

          let newPose = "stand";
          if (indexUp && middleDown && ringDown && pinkyDown) {
            newPose = "sit";
          }

          gestureHistory.push(newPose);
          if (gestureHistory.length > 7) gestureHistory.shift();

          const poseCounts = gestureHistory.reduce((acc, pose) => {
            acc[pose] = (acc[pose] || 0) + 1;
            return acc;
          }, {});

          const dominantPose =
            (poseCounts["sit"] || 0) > (poseCounts["stand"] || 0)
              ? "sit"
              : "stand";

          const now = Date.now();
          if (dominantPose !== lastPose && now - lastGestureTime > 1000) {
            setLastPose(dominantPose);
            lastGestureTime = now;
            console.log("✋ Detected hand pose:", dominantPose);
            applyPoseToRobot(dominantPose);
          }
        }
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current?.videoWidth > 0) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 320,
          height: 240,
        });

        camera.start();
      };
    };

    startCameraWithMediaPipe();

    return () => {
      if (peerConnection.current) peerConnection.current.close();
      socket.current.disconnect();
    };
  }, [lastPose]);

  const setupPeerConnection = async (requestingLaptopSocketId) => {
    if (peerConnection.current) peerConnection.current.close();

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerConnection.current = pc;

    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice_candidate_from_phone", {
          candidate: event.candidate,
          phoneDeviceId: PHONE_DEVICE_ID,
          requestingLaptopSocketId,
        });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.current.emit("sdp_offer_from_phone", {
      sdpOffer: offer,
      phoneDeviceId: PHONE_DEVICE_ID,
      requestingLaptopSocketId,
    });
  };

  return (
    <div style={{ paddingTop: "80px", background: "#fff", height: "100vh" }}>
      <div style={{ textAlign: "center", padding: "10px" }}>
        <h2>🤖 Robot + Hand Control</h2>
        <p>{status}</p>
        <p>
          Device ID: <strong>{PHONE_DEVICE_ID}</strong>
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 150px)",
          padding: "10px",
          gap: "20px",
        }}
      >
        {/* 📷 Webcam + Canvas Overlay */}
        <div
          style={{
            flex: "0 0 30%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #ddd",
            paddingRight: "10px",
            width: "320px",
            height: "240px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              display: "none",
            }}
          />
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            style={{
              width: "320px",
              height: "240px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          />
        </div>

        {/* 🤖 Robot Canvas */}
        <div style={{ flex: "1", height: "100%" }}>
          <Canvas
            camera={{ position: [0, 1.5, 3], fov: 50 }}
            style={{ width: "100%", height: "100%" }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            <OrbitControls />
            <URDFRobot />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
