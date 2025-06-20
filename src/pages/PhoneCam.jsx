import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoader from "urdf-loader";
import * as THREE from "three";
import { io } from "socket.io-client";

// ✅ Your deployed backend URL
const NODE_SERVER_URL = "https://website-and-cloudgame-2.onrender.com";
const PHONE_DEVICE_ID = `phone-${Math.random().toString(36).substring(7)}`;

export default function PhoneCam() {
  const peerConnection = useRef(null);
  const socket = useRef(null);
  const [status, setStatus] = useState("Connecting...");
  const localStreamRef = useRef(null);

  // ✅ Load 3D URDF robot
  function URDFRobot() {
    const robotRef = useRef();

    useEffect(() => {
      const manager = new THREE.LoadingManager();
      const loader = new URDFLoader(manager);
      loader.packages = "/model/";

      loader.load(
        "/model/jaxon_jvrc.urdf",
        (robot) => {
          robot.rotation.set(-Math.PI / 2, 0, Math.PI); // Face camera correctly
          robotRef.current.add(robot);
          robotRef.current.robot = robot;
          window.robot = robot;

          robot.traverse((child) => {
            if (child.jointType) {
              console.log("🔩 Joint:", child.name, "| Type:", child.jointType);
            }
          });

          socket.current.on("joint-control", ({ joint, value }) => {
            console.log("🛰️ Received joint-control:", { joint, value });
            robot.joints[joint]?.setJointValue(value);
          });

          socket.current.on("pose-change", (pose) => {
            console.log("📲 Pose received:", pose);
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
          });
        },
        undefined,
        (err) => console.error("❌ URDF Load error", err)
      );
    }, []);

    return <group ref={robotRef} />;
  }

  // ✅ Handle WebRTC setup & signaling
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

    const getLocalStream = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Browser does not support camera access.");
        return null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        localStreamRef.current = stream;
        return stream;
      } catch (err) {
        setStatus("🚫 Camera access denied.");
        alert("Camera access denied. Please allow permission.");
        return null;
      }
    };

    getLocalStream();

    return () => {
      if (peerConnection.current) peerConnection.current.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      socket.current.disconnect();
    };
  }, []);

  // ✅ Setup WebRTC offer to laptop
  const setupPeerConnection = async (requestingLaptopSocketId) => {
    if (peerConnection.current) peerConnection.current.close();

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) =>
        pc.addTrack(track, localStreamRef.current)
      );
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
      <div style={{ padding: "10px 20px", textAlign: "center" }}>
        <h2 style={{ margin: 0 }}>📱 Robot Viewer & Streamer</h2>
        <p>{status}</p>
        <p>Device ID: <strong>{PHONE_DEVICE_ID}</strong></p>
      </div>
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        gl={{ useLegacyLights: false }}
        dpr={[1, 2]}
        style={{ height: "70vh", width: "100%" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <OrbitControls />
        <URDFRobot />
      </Canvas>
    </div>
  );
}
