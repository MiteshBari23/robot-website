// ✅ PhoneCam.jsx
import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoader from "urdf-loader";
import * as THREE from "three";
import { io } from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");
window.socket = socket;

function URDFRobot() {
  const robotRef = useRef();

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    loader.packages = "/model/";

    loader.load(
      "/model/jaxon_jvrc.urdf",
      (robot) => {
        robot.rotation.y = Math.PI; // Face the robot toward the camera
        robotRef.current.add(robot);
        robotRef.current.robot = robot;
        window.robot = robot;

        robot.traverse((child) => {
          if (child.jointType) {
            console.log("🔩 Joint:", child.name, "| Type:", child.jointType);
          }
        });

        socket.on("joint-control", ({ joint, value }) => {
          console.log("🛰️ Received joint-control event on Phone:", {
            joint,
            value,
          });
          if (robot.joints[joint]) {
            robot.joints[joint].setJointValue(value);
            console.log(`🎯 Updated joint '${joint}' to value: ${value}`);
          } else {
            console.warn(`⚠️ Joint '${joint}' not found in robot`);
          }
        });

        socket.on("pose-change", (pose) => {
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
      (err) => console.error("Failed to load URDF", err)
    );
  }, []);

  return <group ref={robotRef} />;
}

export default function PhoneCam() {
  return (
    <div style={{ height: "100vh", background: "#FFFFFF" }}>
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }} style={{ background: "white" }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <URDFRobot />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

const styles = {
  container: { marginTop: "80px", padding: "20px", textAlign: "center" },
  heading: { fontSize: "24px", marginBottom: "10px" },
  poseText: { fontSize: "16px", marginBottom: "20px" },
  canvasWrapper: {
    height: "400px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgb(254, 254, 254)",
  },
};
