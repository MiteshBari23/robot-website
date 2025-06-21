import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoader from "urdf-loader";
import * as THREE from "three";
import { io } from "socket.io-client";

const socket = io("https://website-and-cloudgame-2.onrender.com");

function URDFRobot() {
  const robotRef = useRef();

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    loader.packages = "/model/";

    loader.load("/model/jaxon_jvrc.urdf", (robot) => {
      robotRef.current.add(robot);
      window.robot = robot;

      // Fix orientation
      robot.rotation.y = Math.PI;

      robot.traverse((child) => {
        if (child.isMesh) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
          // child.material = new THREE.MeshStandardMaterial({
          //   color: 0x6699ff,
          //   metalness: 0.3,
          //   roughness: 0.7,
          // });
        }
      });

      // Log joints
      robot.traverse((child) => {
        if (child.jointType) {
          console.log("🔩", child.name, "| Type:", child.jointType);
        }
      });

      // Handle poses
      socket.on("pose-change", (pose) => {
        const set = (j, v) => robot.joints[j]?.setJointValue(v);

        switch (pose) {
          case "legs-forward":
            set("LLEG_JOINT2", 0.5);
            set("RLEG_JOINT2", 0.5);
            break;
          case "sit":
            set("LLEG_JOINT2", -0.7);
            set("LLEG_JOINT3", 1.2);
            set("RLEG_JOINT2", -0.7);
            set("RLEG_JOINT3", 1.2);
            break;
          case "reset":
            Object.keys(robot.joints).forEach((jointName) =>
              robot.joints[jointName].setJointValue(0)
            );
            break;
          default:
            console.log("Unknown pose:", pose);
        }
      });
    });
  }, []);

  return <group ref={robotRef} />;
}

export default function GltfViewer() {
  return (
    <div style={{ height: "100vh", background: "#fff" }}>
      <Canvas
        camera={{ position: [0, 2, 4], fov: 50 }}
        style={{ background: "white" }}
        gl={{ outputColorSpace: THREE.SRGBColorSpace }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 2, 2]} intensity={1.5} />
        <URDFRobot />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
