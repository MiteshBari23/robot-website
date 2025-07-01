import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoader from "urdf-loader";
import * as THREE from "three";
import { io } from "socket.io-client";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";

const NODE_SERVER_URL = "https://website-and-cloudgame-2.onrender.com";
const PHONE_DEVICE_ID = `phone-${Math.random().toString(36).substring(7)}`;
let robotInstance = null;

const flipY = (pt) => ({ x: pt.x, y: -pt.y });

function getSignedJointAngle(a, b, c) {
  a = flipY(a);
  b = flipY(b);
  c = flipY(c);
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const cross = ab.x * cb.y - ab.y * cb.x;
  return Math.atan2(cross, dot);
}

function getJointAngle(a, b, c) {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.hypot(ba.x, ba.y);
  const magBC = Math.hypot(bc.x, bc.y);
  if (magBA === 0 || magBC === 0) return 0;
  const angle = Math.acos(dot / (magBA * magBC));
  return isNaN(angle) ? 0 : angle;
}

function URDFRobot() {
  const robotRef = useRef();

  useEffect(() => {
    if (robotRef.current?.children?.length > 0) return;
    if (robotInstance) {
      robotRef.current.add(robotInstance);
      return;
    }

    const loader = new URDFLoader(new THREE.LoadingManager());
    loader.packages = "/model/";

    loader.load(
      "/model/Poppy_Humanoid.urdf",
      (robot) => {
        robot.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
        robotRef.current.add(robot);
        robotInstance = robot;
        window.robot = robot;

        Object.entries(robot.joints).forEach(([name, joint]) => {
          const cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.03, 0.03),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          joint.add(cube);
          cube.position.set(0, 0, 0);
        });
      },
      undefined,
      (err) => console.error("❌ Failed to load URDF", err)
    );
  }, []);

  return <group ref={robotRef} />;
}

export default function PhoneCam() {
  const robotRef = useRef();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerConnection = useRef(null);
  const socket = useRef(null);
  const [status, setStatus] = useState("Connecting...");

  const applyJointRotation = (jointName, value) => {
    const robot = window.robot;
    const joint = robot?.joints?.[jointName];
    if (!joint) return;
    const { lower, upper } = joint.limit || {};
    const clampedValue = THREE.MathUtils.clamp(value, lower ?? -Math.PI, upper ?? Math.PI);
    joint.setJointValue(clampedValue);
  };

  const startCameraWithHolistic = async () => {
    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    holistic.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const p = results.poseLandmarks;
      if (!p) return;

      // 🎯 Visualize joints as circles
      p.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
        ctx.strokeStyle = "#003300";
        ctx.stroke();
      });

      // 🔗 Draw limb connections
      const connections = [
        [11, 13], [13, 15], // Left arm
        [12, 14], [14, 16], // Right arm
        [11, 12], // shoulders
        [23, 24], // hips
        [11, 23], [12, 24], // torso
        [23, 25], [25, 27], // left leg
        [24, 26], [26, 28], // right leg
      ];
      ctx.strokeStyle = "#00BFFF";
      ctx.lineWidth = 2;
      connections.forEach(([i, j]) => {
        if (p[i] && p[j]) {
          ctx.beginPath();
          ctx.moveTo(p[i].x * canvas.width, p[i].y * canvas.height);
          ctx.lineTo(p[j].x * canvas.width, p[j].y * canvas.height);
          ctx.stroke();
        }
      });

      // 🤖 Apply robot joint rotations
      try {
        if (p[12] && p[14] && p[16]) {
          const sx = getSignedJointAngle(p[16], p[12], p[14]);
          const sy = -sx;
          const elbow = getJointAngle(p[12], p[14], p[16]);
          applyJointRotation("r_shoulder_x", sx);
          applyJointRotation("r_shoulder_y", sy);
          applyJointRotation("r_elbow_y", Math.PI - elbow);
        }

        if (p[11] && p[13] && p[15]) {
          const sx = getSignedJointAngle(p[15], p[11], p[13]);
          const sy = -sx;
          const elbow = getJointAngle(p[11], p[13], p[15]);
          applyJointRotation("l_shoulder_x", -sx);
          applyJointRotation("l_shoulder_y", sy);
          applyJointRotation("l_elbow_y", Math.PI - elbow);
        }
      } catch (e) {
        console.warn("Pose angle error", e);
      }
    });

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      const cam = new Camera(videoRef.current, {
        onFrame: async () => await holistic.send({ image: videoRef.current }),
        width: 320,
        height: 240,
      });
      cam.start();
    };
  };

  const setupPeerConnection = async (requestingLaptopSocketId) => {
    if (peerConnection.current) peerConnection.current.close();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerConnection.current = pc;

    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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

  useEffect(() => {
    socket.current = io(NODE_SERVER_URL);

    socket.current.on("connect", () => {
      setStatus("✅ Connected. Registering phone...");
      socket.current.emit("register_phone", PHONE_DEVICE_ID);
    });

    socket.current.on("start_webrtc_offer", async ({ requestingLaptopSocketId }) => {
      setStatus("📡 Laptop requested stream...");
      await setupPeerConnection(requestingLaptopSocketId);
    });

    socket.current.on("sdp_answer_from_laptop", async (sdpAnswer) => {
      if (peerConnection.current && !peerConnection.current.remoteDescription) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdpAnswer));
        setStatus("✅ WebRTC connected.");
      }
    });

    socket.current.on("ice_candidate_from_laptop", async (candidate) => {
      if (peerConnection.current && candidate) {
        await peerConnection.current.addIceCandidate(candidate);
      }
    });

    startCameraWithHolistic();

    return () => {
      if (peerConnection.current) peerConnection.current.close();
      socket.current.disconnect();
    };
  }, []);

    // const setupPeerConnection = async (requestingLaptopSocketId) => {
  //   if (peerConnection.current) peerConnection.current.close();
  //   const pc = new RTCPeerConnection({
  //     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  //   });
  //   peerConnection.current = pc;

  //   const stream = videoRef.current?.srcObject;
  //   if (stream) {
  //     stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  //   }

  //   pc.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       socket.current.emit("ice_candidate_from_phone", {
  //         candidate: event.candidate,
  //         phoneDeviceId: PHONE_DEVICE_ID,
  //         requestingLaptopSocketId,
  //       });
  //     }
  //   };

  //   const offer = await pc.createOffer();
  //   await pc.setLocalDescription(offer);

  //   socket.current.emit("sdp_offer_from_phone", {
  //     sdpOffer: offer,
  //     phoneDeviceId: PHONE_DEVICE_ID,
  //     requestingLaptopSocketId,
  //   });
  // };

  return (
    <div style={{ paddingTop: "80px", background: "#FFFFFF", height: "100vh" }}>
      <div style={{ textAlign: "center", padding: "10px" }}>
        <h2>🤖 Full-Body Robot Tracker</h2>
        <p>{status}</p>
        <p>Device ID: <strong>{PHONE_DEVICE_ID}</strong></p>
      </div>
      <div style={{ display: "flex", height: "calc(100vh - 150px)", padding: "10px", gap: "20px" }}>
        <div style={{ width: "320px", height: "240px", borderRight: "1px solid #ddd" }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ display: "none" }} />
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
        <div style={{ flex: 1, height: "100%" }}>
          <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }} style={{ width: "100%", height: "100%" }}>
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