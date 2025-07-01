// RobotUploader.jsx
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import URDFLoader from "urdf-loader";
import { ColladaLoader } from "three-stdlib";
import { STLLoader } from "three-stdlib";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";

export default function RobotUploader() {
  const [fileMap, setFileMap] = useState(new Map());
  const [urdfFile, setUrdfFile] = useState(null);
  const [robotModel, setRobotModel] = useState(null);
  const robotRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previousJointValues = useRef({});
  const [isRecording, setIsRecording] = useState(false); // ✅ for UI
  const isRecordingRef = useRef(false); // ✅ for runtime-safe flag
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordedFrames = useRef([]);
  const recordedBlobsRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  const disableLiveTrackingRef = useRef(false);
  const cameraRef = useRef(null); // NEW camera ref
  const playbackVideoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const holisticRef = useRef(null); // ✅ Add this

  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/recordings")
      .then((res) => res.json())
      .then(setRecordings);
  }, []);

  const loadRecording = async (id) => {
    const url = `http://localhost:5000/video/${id}`;
    setRecordedVideoURL(url);
  };

  const smooth = (jointName, value, alpha = 0.2) => {
    const prev = previousJointValues.current[jointName] ?? value;
    const smoothed = prev * (1 - alpha) + value * alpha;
    previousJointValues.current[jointName] = smoothed;
    return smoothed;
  };

  // const handleHolisticResults = (results) => {
  //   // LEFT ARM
  //   if (p[11] && p[13] && p[15]) {
  //     const upper = create2DVector(p[11], p[13]);
  //     const lower = create2DVector(p[13], p[15]);
  //     const upperAngle = angle2D(upper);
  //     const upperLen = vectorMagnitude(upper);
  //     const lowerLen = vectorMagnitude(lower);
  //     const angle = angleBetweenVectors(upper, lower);

  //     let sx =
  //       Math.abs(upperAngle) > Math.PI / 4
  //         ? 1.5
  //         : (Math.abs(upperAngle) / (Math.PI / 4)) * 1.5;
  //     let sy = (upper.y / upperLen) * 1.5;
  //     let elbow = (-2.6 / Math.PI) * angle + 0.02;

  //     applyJointRotation("l_shoulder_x", smooth("l_shoulder_x", sx));
  //     applyJointRotation("l_shoulder_y", smooth("l_shoulder_y", sy));
  //     applyJointRotation("l_elbow_y", smooth("l_elbow_y", elbow));
  //     applyJointRotation("l_arm_z", smooth("l_arm_z", (p[15].x - p[11].x) * 3)); // horizontal swing
  //   }

  //   // RIGHT ARM
  //   if (p[12] && p[14] && p[16]) {
  //     const shoulder = p[12];
  //     const elbow = p[14];
  //     const wrist = p[16];

  //     const upper = create2DVector(shoulder, elbow);
  //     const lower = create2DVector(elbow, wrist);

  //     const upperLen = vectorMagnitude(upper);
  //     const angle = angleBetweenVectors(upper, lower);
  //     const elbowY = (2.6 / Math.PI) * angle - 0.02;

  //     // Detect arm orientation
  //     const armVertical = upper.y / upperLen; // Positive when hand is down, negative when up
  //     const armHorizontal = upper.x / upperLen;

  //     // Thresholds
  //     const VERTICAL_THRESHOLD = 0.5; // y-dominant
  //     const HORIZONTAL_THRESHOLD = 0.5; // x-dominant

  //     let shoulderY = 0;
  //     let shoulderX = 0;

  //     if (Math.abs(armVertical) > VERTICAL_THRESHOLD) {
  //       // Hand is vertically up or down
  //       shoulderY = -1.5 * Math.sign(armVertical); // MediaPipe: up → negative y → +1.5
  //       shoulderX = 1.5;
  //     } else if (Math.abs(armHorizontal) > HORIZONTAL_THRESHOLD) {
  //       // Arm stretched out horizontally
  //       shoulderY = 0;
  //       shoulderX = 0;
  //     } else {
  //       // Hands forward (foreshortened)
  //       shoulderY = 0;
  //       shoulderX = 1.5;
  //     }

  //     // Optional swing for future
  //     // const swingZ = smooth("r_arm_z", (wrist.x - shoulder.x) * 4);
  //     // applyJointRotation("r_arm_z", swingZ);

  //     applyJointRotation("r_shoulder_x", smooth("r_shoulder_x", shoulderX));
  //     applyJointRotation("r_shoulder_y", smooth("r_shoulder_y", shoulderY));
  //     applyJointRotation("r_elbow_y", smooth("r_elbow_y", elbowY));
  //   }

  //   // HEAD pitch (nod)
  //   if (p[0]) {
  //     const yaw = (p[0].x - 0.5) * Math.PI * 0.8;
  //     const pitch = (0.5 - p[0].y) * Math.PI * 0.5;
  //     applyJointRotation("head_y", smooth("head_y", yaw));
  //     applyJointRotation("head_z", smooth("head_z", pitch));
  //   }

  //   // HEAD yaw (left/right)
  //   if (p[0] && p[11] && p[12]) {
  //     const shoulderMidX = (p[11].x + p[12].x) / 2;
  //     const headX = p[0].x;
  //     const yaw = (headX - shoulderMidX) * Math.PI;
  //     applyJointRotation("head_y", smooth("head_y", yaw));
  //   }
  //   // abs y
  //   if (p[11] && p[12] && p[23] && p[24]) {
  //     const lShoulder = p[11];
  //     const rShoulder = p[12];
  //     const lHip = p[23];
  //     const rHip = p[24];

  //     const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
  //     const hipMidY = (lHip.y + rHip.y) / 2;

  //     const forwardBend = -(shoulderMidY + hipMidY) * 4; // ← fixed sign
  //     const clamped = THREE.MathUtils.clamp(forwardBend, 1.2, 1.2);

  //     applyJointRotation("abs_y", smooth("abs_y", clamped));
  //   }

  //   //hips
  //   if (p[11] && p[12] && p[23] && p[24]) {
  //     const lShoulder = p[11];
  //     const rShoulder = p[12];
  //     const lHip = p[23];
  //     const rHip = p[24];

  //     // Midpoints
  //     const shoulderMid = {
  //       x: (lShoulder.x + rShoulder.x) / 2,
  //       y: (lShoulder.y + rShoulder.y) / 2,
  //     };
  //     const hipMid = {
  //       x: (lHip.x + rHip.x) / 2,
  //       y: (lHip.y + rHip.y) / 2,
  //     };

  //     // // === Forward/Backward Lean (abs_x) ===
  //     // const verticalDisplacement = shoulderMid.y - hipMid.y; // smaller = bending forward
  //     // const absX = smooth("abs_x", (0.4 - verticalDisplacement) * 4); // Adjust scalar for sensitivity

  //     // === Side Lean (abs_z) ===
  //     const leftTorsoLength = lShoulder.y - lHip.y;
  //     const rightTorsoLength = rShoulder.y - rHip.y;
  //     const absZ = smooth("abs_z", (rightTorsoLength - leftTorsoLength) * 4);

  //     // applyJointRotation("abs_x", absX);
  //     applyJointRotation("abs_z", absZ);
  //   }

  //   // legs right one
  //   if (p[24] && p[26] && p[28] && p[32]) {
  //     const hip = p[24]; // Right hip
  //     const knee = p[26]; // Right knee
  //     const ankle = p[28]; // Right ankle
  //     const foot = p[32]; // Right foot index

  //     // --- Hip Y rotation (forward/backward leg swing) ---
  //     const femurVec = create2DVector(hip, knee);
  //     const verticalVec = { x: 0, y: 1 };
  //     let hipAngle = angleBetweenVectors(femurVec, verticalVec);

  //     // Direction: if leg swings forward (knee.x < hip.x), angle negative
  //     if (knee.x < hip.x) hipAngle *= 1;

  //     // Clamp and smooth
  //     const r_hip_y = smooth(
  //       "r_hip_y",
  //       THREE.MathUtils.clamp(hipAngle, -1.5, 1.5)
  //     );
  //     applyJointRotation("r_hip_y", r_hip_y);

  //     // --- Hip X rotation (sideward leg raise, optional) ---
  //     const r_hip_x = smooth("r_hip_x", (hip.x - knee.x) * 3);
  //     applyJointRotation("r_hip_x", r_hip_x);

  //     // --- Knee Y (bend) ---
  //     const tibiaVec = create2DVector(knee, ankle);
  //     const kneeAngle = angleBetweenVectors(femurVec, tibiaVec);

  //     // Map from 0 (straight) to -2.3 rad (full bend)
  //     let r_knee_y = -(kneeAngle / 2.5) * 2.3;
  //     r_knee_y = smooth("r_knee_y", THREE.MathUtils.clamp(r_knee_y, -2.3, 0));
  //     applyJointRotation("r_knee_y", r_knee_y);

  //     // --- Ankle Y (pitch up/down) ---
  //     const footVec = create2DVector(ankle, foot);
  //     let footAngle = angleBetweenVectors(footVec, { x: 0, y: 1 });

  //     if (foot.x < ankle.x) footAngle *= -1;

  //     let r_ankle_y = (footAngle / Math.PI) * 0.8;
  //     r_ankle_y = smooth(
  //       "r_ankle_y",
  //       THREE.MathUtils.clamp(r_ankle_y, -0.8, 0.8)
  //     );
  //     applyJointRotation("r_ankle_y", r_ankle_y);
  //   }

  //   // legs left one
  //   if (p[23] && p[25] && p[27] && p[31]) {
  //     const hip = p[23]; // Left hip
  //     const knee = p[25]; // Left knee
  //     const ankle = p[27]; // Left ankle
  //     const foot = p[31]; // Left foot index

  //     // --- Hip Y rotation (forward/backward leg swing) ---
  //     const femurVec = create2DVector(hip, knee);
  //     const verticalVec = { x: 0, y: 1 };
  //     let hipAngle = angleBetweenVectors(femurVec, verticalVec);

  //     // For left leg: check if knee is forward (knee.x > hip.x)
  //     if (knee.x > hip.x) hipAngle *= -1;

  //     const l_hip_y = smooth(
  //       "l_hip_y",
  //       THREE.MathUtils.clamp(hipAngle, -1.5, 1.5)
  //     );
  //     applyJointRotation("l_hip_y", l_hip_y);

  //     // --- Hip X rotation (side raise) ---
  //     // For left leg, reverse x-difference sign to mirror the right
  //     const l_hip_x = smooth("l_hip_x", (knee.x - hip.x) * 3);
  //     applyJointRotation("l_hip_x", l_hip_x);

  //     // --- Knee Y (bend) ---
  //     const tibiaVec = create2DVector(knee, ankle);
  //     let kneeAngle = angleBetweenVectors(femurVec, tibiaVec);

  //     let l_knee_y = -(kneeAngle / 2.5) * 2.3;
  //     l_knee_y = smooth("l_knee_y", THREE.MathUtils.clamp(l_knee_y, -2.3, 0));
  //     applyJointRotation("l_knee_y", l_knee_y);

  //     // --- Ankle Y (pitch up/down) ---
  //     const footVec = create2DVector(ankle, foot);
  //     let footAngle = angleBetweenVectors(footVec, { x: 0, y: 1 });

  //     if (foot.x > ankle.x) footAngle *= -1; // mirror right foot logic

  //     let l_ankle_y = (footAngle / Math.PI) * 0.8;
  //     l_ankle_y = smooth(
  //       "l_ankle_y",
  //       THREE.MathUtils.clamp(l_ankle_y, -0.8, 0.8)
  //     );
  //     applyJointRotation("l_ankle_y", l_ankle_y);
  //   }
  // };

  const create2DVector = (p1, p2) => ({ x: p2.x - p1.x, y: p2.y - p1.y });
  const angle2D = (vec) => Math.atan2(vec.y, vec.x);
  const vectorMagnitude = (vec) => Math.hypot(vec.x, vec.y);
  const angleBetweenVectors = (vec1, vec2) => {
    const dot = vec1.x * vec2.x + vec1.y * vec2.y;
    const mag1 = vectorMagnitude(vec1);
    const mag2 = vectorMagnitude(vec2);
    if (mag1 === 0 || mag2 === 0) return 0;
    const clamped = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(clamped);
  };

  const handleMeshFolderUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMap = new Map();
    files.forEach((file) => {
      const path = file.webkitRelativePath || file.name;
      const normalized = path
        .replace(/\\/g, "/")
        .split("/")
        .slice(-2)
        .join("/");
      newMap.set(normalized, URL.createObjectURL(file));
    });
    setFileMap(newMap);
  };

  const handleUrdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".urdf")) {
      setUrdfFile({ name: file.name, url: URL.createObjectURL(file) });
    } else {
      alert("Upload a valid URDF file");
    }
  };

  useEffect(() => {
    if (!urdfFile || fileMap.size === 0) return;
    const loader = new URDFLoader();
    loader.loadMeshCb = (path, manager, done) => {
      const clean = path
        .replace(/^.*?(meshes\/|robot\/|assets\/)?/, "")
        .replace(/^\/+/, "");
      const candidates = [
        clean,
        `meshes/${clean}`,
        `robot/${clean}`,
        `assets/${clean}`,
      ];
      let fileUrl = null;
      for (let key of candidates) {
        if (fileMap.has(key)) {
          fileUrl = fileMap.get(key);
          break;
        }
      }
      if (!fileUrl) return done(null);
      const ext = clean.split(".").pop().toLowerCase();
      if (ext === "stl") {
        new STLLoader().load(fileUrl, (geo) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
          done(new THREE.Mesh(geo, mat));
        });
      } else if (ext === "dae") {
        new ColladaLoader().load(fileUrl, (dae) => done(dae.scene));
      } else {
        done(null);
      }
    };
    loader.load(urdfFile.url, (robot) => {
      robot.rotation.set(-Math.PI / 2, 0, 0);
      setRobotModel(robot);
      robotRef.current = robot;
      console.log("Loaded joints:", Object.keys(robot.joints)); // ✅ Add this line
      Object.entries(robot.joints || {}).forEach(([name, joint]) => {
        joint.setJointValue(0); // default all to 0
      });
    });
  }, [urdfFile, fileMap]);

  const applyJointRotation = (jointName, angle) => {
    const joint = robotRef.current?.joints?.[jointName];
    if (!joint) return;

    const { lower, upper } = joint.limit || {};
    const clamped = THREE.MathUtils.clamp(
      angle,
      lower ?? -Math.PI,
      upper ?? Math.PI
    );
    joint.setJointValue(clamped);

    // Force Three.js to re-render by updating matrices
    if (robotRef.current) {
      robotRef.current.updateMatrixWorld(true);
    }
    // console.log(`🦿 ${jointName} => ${clamped.toFixed(3)}`);z
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const holistic = new Holistic({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });
    holisticRef.current = holistic; // ✅ store reference

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    holistic.onResults((results) => {
      // Skip frame if disabled during playback

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      console.log("MediaPipe frame received");

      const p = results.poseLandmarks;
      if (!p || !robotRef.current || p.length < 33) return;

      if (isRecordingRef.current && robotRef.current?.joints) {
        console.log("Recording frame...");
        const snapshot = {};
        Object.entries(robotRef.current.joints).forEach(([joint, jointObj]) => {
          snapshot[joint] = jointObj.jointValue;
        });
        recordedFrames.current.push(snapshot);
      }

      // Draw landmarks
      ctx.fillStyle = "#00FF00";
      p.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Helper to draw a line between two landmarks
      const drawLine = (a, b, color = "#00FF00") => {
        if (!a || !b) return;
        ctx.beginPath();
        ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      // POSE Landmark Connections (Full Body Skeleton)
      const POSE_CONNECTIONS = [
        // Torso
        [11, 12], // shoulders
        [11, 23], // left shoulder to left hip
        [12, 24], // right shoulder to right hip
        [23, 24], // hips
        // Arms
        [11, 13],
        [13, 15], // left arm
        [12, 14],
        [14, 16], // right arm
        // Legs
        [23, 25],
        [25, 27],
        [27, 31], // left leg
        [24, 26],
        [26, 28],
        [28, 32], // right leg
        // Head
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 7], // left eye to ear
        [0, 4],
        [4, 5],
        [5, 6],
        [6, 8], // right eye to ear
        [0, 9],
        [0, 10], // nose to mouth corners (if available)
        [9, 10], // mouth corners
      ];

      // Draw all lines
      POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        drawLine(p[startIdx], p[endIdx]);
      });
      p.forEach((pt, i) => {
        ctx.fillStyle = "#FF0000";
        ctx.fillText(i, pt.x * canvas.width + 4, pt.y * canvas.height + 4);
      });

      // LEFT ARM
      if (p[11] && p[13] && p[15]) {
        const upper = create2DVector(p[11], p[13]);
        const lower = create2DVector(p[13], p[15]);
        const upperAngle = angle2D(upper);
        const upperLen = vectorMagnitude(upper);
        const lowerLen = vectorMagnitude(lower);
        const angle = angleBetweenVectors(upper, lower);

        let sx =
          Math.abs(upperAngle) > Math.PI / 4
            ? 1.5
            : (Math.abs(upperAngle) / (Math.PI / 4)) * 1.5;
        let sy = (upper.y / upperLen) * 1.5;
        let elbow = (-2.6 / Math.PI) * angle + 0.02;

        applyJointRotation("l_shoulder_x", smooth("l_shoulder_x", sx));
        applyJointRotation("l_shoulder_y", smooth("l_shoulder_y", sy));
        applyJointRotation("l_elbow_y", smooth("l_elbow_y", elbow));
        applyJointRotation(
          "l_arm_z",
          smooth("l_arm_z", (p[15].x - p[11].x) * 3)
        ); // horizontal swing
      }

      // RIGHT ARM
      if (p[12] && p[14] && p[16]) {
        const shoulder = p[12];
        const elbow = p[14];
        const wrist = p[16];

        const upper = create2DVector(shoulder, elbow);
        const lower = create2DVector(elbow, wrist);

        const upperLen = vectorMagnitude(upper);
        const angle = angleBetweenVectors(upper, lower);
        const elbowY = (2.6 / Math.PI) * angle - 0.02;

        // Detect arm orientation
        const armVertical = upper.y / upperLen; // Positive when hand is down, negative when up
        const armHorizontal = upper.x / upperLen;

        // Thresholds
        const VERTICAL_THRESHOLD = 0.5; // y-dominant
        const HORIZONTAL_THRESHOLD = 0.5; // x-dominant

        let shoulderY = 0;
        let shoulderX = 0;

        if (Math.abs(armVertical) > VERTICAL_THRESHOLD) {
          // Hand is vertically up or down
          shoulderY = -1.5 * Math.sign(armVertical); // MediaPipe: up → negative y → +1.5
          shoulderX = 1.5;
        } else if (Math.abs(armHorizontal) > HORIZONTAL_THRESHOLD) {
          // Arm stretched out horizontally
          shoulderY = 0;
          shoulderX = 0;
        } else {
          // Hands forward (foreshortened)
          shoulderY = 0;
          shoulderX = 1.5;
        }

        // Optional swing for future
        // const swingZ = smooth("r_arm_z", (wrist.x - shoulder.x) * 4);
        // applyJointRotation("r_arm_z", swingZ);

        applyJointRotation("r_shoulder_x", smooth("r_shoulder_x", shoulderX));
        applyJointRotation("r_shoulder_y", smooth("r_shoulder_y", shoulderY));
        applyJointRotation("r_elbow_y", smooth("r_elbow_y", elbowY));
      }

      // HEAD pitch (nod)
      if (p[0]) {
        const yaw = (p[0].x - 0.5) * Math.PI * 0.8;
        const pitch = (0.5 - p[0].y) * Math.PI * 0.5;
        applyJointRotation("head_y", smooth("head_y", yaw));
        applyJointRotation("head_z", smooth("head_z", pitch));
      }

      // HEAD yaw (left/right)
      if (p[0] && p[11] && p[12]) {
        const shoulderMidX = (p[11].x + p[12].x) / 2;
        const headX = p[0].x;
        const yaw = (headX - shoulderMidX) * Math.PI;
        applyJointRotation("head_y", smooth("head_y", yaw));
      }
      // abs y
      if (p[11] && p[12] && p[23] && p[24]) {
        const lShoulder = p[11];
        const rShoulder = p[12];
        const lHip = p[23];
        const rHip = p[24];

        const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
        const hipMidY = (lHip.y + rHip.y) / 2;

        const forwardBend = -(shoulderMidY + hipMidY) * 4; // ← fixed sign
        const clamped = THREE.MathUtils.clamp(forwardBend, 1.2, 1.2);

        applyJointRotation("abs_y", smooth("abs_y", clamped));
      }

      //hips
      if (p[11] && p[12] && p[23] && p[24]) {
        const lShoulder = p[11];
        const rShoulder = p[12];
        const lHip = p[23];
        const rHip = p[24];

        // Midpoints
        const shoulderMid = {
          x: (lShoulder.x + rShoulder.x) / 2,
          y: (lShoulder.y + rShoulder.y) / 2,
        };
        const hipMid = {
          x: (lHip.x + rHip.x) / 2,
          y: (lHip.y + rHip.y) / 2,
        };

        // // === Forward/Backward Lean (abs_x) ===
        // const verticalDisplacement = shoulderMid.y - hipMid.y; // smaller = bending forward
        // const absX = smooth("abs_x", (0.4 - verticalDisplacement) * 4); // Adjust scalar for sensitivity

        // === Side Lean (abs_z) ===
        const leftTorsoLength = lShoulder.y - lHip.y;
        const rightTorsoLength = rShoulder.y - rHip.y;
        const absZ = smooth("abs_z", (rightTorsoLength - leftTorsoLength) * 4);

        // applyJointRotation("abs_x", absX);
        applyJointRotation("abs_z", absZ);
      }

      // legs right one
      if (p[24] && p[26] && p[28] && p[32]) {
        const hip = p[24]; // Right hip
        const knee = p[26]; // Right knee
        const ankle = p[28]; // Right ankle
        const foot = p[32]; // Right foot index

        // --- Hip Y rotation (forward/backward leg swing) ---
        const femurVec = create2DVector(hip, knee);
        const verticalVec = { x: 0, y: 1 };
        let hipAngle = angleBetweenVectors(femurVec, verticalVec);

        // Direction: if leg swings forward (knee.x < hip.x), angle negative
        if (knee.x < hip.x) hipAngle *= 1;

        // Clamp and smooth
        const r_hip_y = smooth(
          "r_hip_y",
          THREE.MathUtils.clamp(hipAngle, -1.5, 1.5)
        );
        applyJointRotation("r_hip_y", r_hip_y);

        // --- Hip X rotation (sideward leg raise, optional) ---
        const r_hip_x = smooth("r_hip_x", (hip.x - knee.x) * 3);
        applyJointRotation("r_hip_x", r_hip_x);

        // --- Knee Y (bend) ---
        const tibiaVec = create2DVector(knee, ankle);
        const kneeAngle = angleBetweenVectors(femurVec, tibiaVec);

        // Map from 0 (straight) to -2.3 rad (full bend)
        let r_knee_y = -(kneeAngle / 2.5) * 2.3;
        r_knee_y = smooth("r_knee_y", THREE.MathUtils.clamp(r_knee_y, -2.3, 0));
        applyJointRotation("r_knee_y", r_knee_y);

        // --- Ankle Y (pitch up/down) ---
        const footVec = create2DVector(ankle, foot);
        let footAngle = angleBetweenVectors(footVec, { x: 0, y: 1 });

        if (foot.x < ankle.x) footAngle *= -1;

        let r_ankle_y = (footAngle / Math.PI) * 0.8;
        r_ankle_y = smooth(
          "r_ankle_y",
          THREE.MathUtils.clamp(r_ankle_y, -0.8, 0.8)
        );
        applyJointRotation("r_ankle_y", r_ankle_y);
      }

      // legs left one
      if (p[23] && p[25] && p[27] && p[31]) {
        const hip = p[23]; // Left hip
        const knee = p[25]; // Left knee
        const ankle = p[27]; // Left ankle
        const foot = p[31]; // Left foot index

        // --- Hip Y rotation (forward/backward leg swing) ---
        const femurVec = create2DVector(hip, knee);
        const verticalVec = { x: 0, y: 1 };
        let hipAngle = angleBetweenVectors(femurVec, verticalVec);

        // For left leg: check if knee is forward (knee.x > hip.x)
        if (knee.x > hip.x) hipAngle *= -1;

        const l_hip_y = smooth(
          "l_hip_y",
          THREE.MathUtils.clamp(hipAngle, -1.5, 1.5)
        );
        applyJointRotation("l_hip_y", l_hip_y);

        // --- Hip X rotation (side raise) ---
        // For left leg, reverse x-difference sign to mirror the right
        const l_hip_x = smooth("l_hip_x", (knee.x - hip.x) * 3);
        applyJointRotation("l_hip_x", l_hip_x);

        // --- Knee Y (bend) ---
        const tibiaVec = create2DVector(knee, ankle);
        let kneeAngle = angleBetweenVectors(femurVec, tibiaVec);

        let l_knee_y = -(kneeAngle / 2.5) * 2.3;
        l_knee_y = smooth("l_knee_y", THREE.MathUtils.clamp(l_knee_y, -2.3, 0));
        applyJointRotation("l_knee_y", l_knee_y);

        // --- Ankle Y (pitch up/down) ---
        const footVec = create2DVector(ankle, foot);
        let footAngle = angleBetweenVectors(footVec, { x: 0, y: 1 });

        if (foot.x > ankle.x) footAngle *= -1; // mirror right foot logic

        let l_ankle_y = (footAngle / Math.PI) * 0.8;
        l_ankle_y = smooth(
          "l_ankle_y",
          THREE.MathUtils.clamp(l_ankle_y, -0.8, 0.8)
        );
        applyJointRotation("l_ankle_y", l_ankle_y);
      }
    });

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        const cam = new Camera(video, {
          onFrame: async () => {
            if (!disableLiveTrackingRef.current) {
              await holistic.send({ image: video });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current = cam;
        cam.start();
      };
    });

    return () => holistic.close();
  }, []);

  //DB
  const uploadRecordingToServer = async () => {
    if (!recordedBlobsRef.current.length) return alert("❌ No data to upload.");

    const blob = new Blob(recordedBlobsRef.current, { type: "video/webm" });
    const formData = new FormData();
    formData.append("video", blob, "recorded_pose.webm");

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(`✅ Uploaded successfully. ID: ${data.id}`);
  };

  const handlePlayback = async () => {
    if (
      !recordedFrames.current.length ||
      !robotRef.current ||
      !recordedVideoURL
    ) {
      alert("⚠️ No recorded data.");
      return;
    }

    const playRecordedWithPoseTracking = () => {
      const video = playbackVideoRef.current;
      const canvas = hiddenCanvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!video || !canvas || !holisticRef.current) {
        console.warn("Missing video/canvas/holistic for recorded playback.");
        return;
      }

      video.play();

      let animationFrameId;
      const processFrame = async () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            await holisticRef.current.send({ image: canvas });
          } catch (e) {
            console.error("🎥 Error sending recorded frame to Holistic:", e);
          }
          animationFrameId = requestAnimationFrame(processFrame);
        }
      };

      video.onplay = () => {
        console.log("▶️ Playing recorded video with pose tracking...");
        animationFrameId = requestAnimationFrame(processFrame);
      };

      video.onpause = () => cancelAnimationFrame(animationFrameId);
      video.onended = () => cancelAnimationFrame(animationFrameId);
    };

    console.log("🎬 Playback started. Frames:", recordedFrames.current.length);
    const videoElement = document.getElementById("playbackVideo");
    videoElement.currentTime = 0;
    videoElement.play();

    setIsPlaying(true);
    for (let i = 0; i < recordedFrames.current.length; i++) {
      if (!isPlaying) break;

      const frame = recordedFrames.current[i];
      Object.entries(frame).forEach(([joint, value]) => {
        applyJointRotation(joint, value);
      });

      console.log("🎞️ Applying frame", i);
      await new Promise((r) => setTimeout(r, 100)); // 10 FPS
    }

    setIsPlaying(false);
    console.log("✅ Playback finished.");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#FFFFFF" }}>
      {/* Left Sidebar */}
      <div
        style={{
          marginTop: "60px",
          width: "370px",
          padding: "20px",
          color: "#fff",
          background: "#1e1e2f",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <h2>📦 Upload Robot Files</h2>
        <h6>Upload URDF files</h6>
        <input
          type="file"
          accept=".urdf"
          onChange={handleUrdfUpload}
          style={{ marginBottom: "10px", width: "100%" }}
        />
        <h6>Upload Mesh folder</h6>
        <input
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleMeshFolderUpload}
          style={{ width: "100%" }}
        />

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            marginTop: "20px",
            borderRadius: "8px",
            border: "2px solid #fff",
            display: "none",
          }}
        />

        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          style={{
            marginTop: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "#000",
            width: "100%",
          }}
        />

        {/* Button Section */}
        <div style={{ marginTop: "20px" }}>
          {/* Start/Stop Recording */}
          <button
            onClick={() => {
              setIsRecording((prev) => {
                const next = !prev;
                isRecordingRef.current = next;

                if (next) {
                  recordedFrames.current = [];
                  recordedBlobsRef.current = [];

                  const stream = canvasRef.current.captureStream(30);
                  const recorder = new MediaRecorder(stream, {
                    mimeType: "video/webm",
                  });

                  recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedBlobsRef.current.push(e.data);
                  };

                  recorder.onstop = () => {
                    const blob = new Blob(recordedBlobsRef.current, {
                      type: "video/webm",
                    });
                    const url = URL.createObjectURL(blob);
                    setRecordedVideoURL(url);
                  };

                  recorder.start();
                  mediaRecorderRef.current = recorder;
                } else {
                  mediaRecorderRef.current?.stop();
                }

                return next;
              });
            }}
            style={{
              backgroundColor: isRecording ? "#dc3545" : "#28a745",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: "6px",
              marginBottom: "10px",
              border: "none",
              width: "100%",
            }}
          >
            {isRecording ? "🟥 Stop Recording" : "🎥 Start Recording"}
          </button>

          {/* Play recorded robot animation */}
          <button
            onClick={async () => {
              if (
                !recordedFrames.current.length ||
                !robotRef.current ||
                !recordedVideoURL
              ) {
                alert("⚠️ Please record first.");
                return;
              }

              disableLiveTrackingRef.current = true;
              console.log("🛑 Disabling MediaPipe live tracking");

              const videoElement = document.getElementById("playbackVideo");
              videoElement.currentTime = 0;
              videoElement.play();

              setIsPlaying(true);
              for (let i = 0; i < recordedFrames.current.length; i++) {
                if (!isPlaying) break;
                const frame = recordedFrames.current[i];
                Object.entries(frame).forEach(([joint, value]) => {
                  applyJointRotation(joint, value);
                });
                await new Promise((r) => setTimeout(r, 100));
              }

              setIsPlaying(false);
              disableLiveTrackingRef.current = false;

              if (cameraRef.current) {
                await cameraRef.current.start();
                console.log("📷 Camera restarted.");
              }

              console.log("✅ Playback done. Re-enabled MediaPipe");
            }}
            style={{
              backgroundColor: "#fa7e21",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: "6px",
              marginBottom: "10px",
              border: "none",
              width: "100%",
            }}
          >
            ▶️ Play Recorded
          </button>

          {/* previous one */}
          <h6>Upload Previous Recording</h6>
          <input
            type="file"
            accept="video/webm"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              const url = URL.createObjectURL(file);
              setRecordedVideoURL(url); // ✅ reused existing state
            }}
            style={{ marginBottom: "10px", width: "100%" }}
          />

          {/* Run MediaPipe Holistic on recorded video */}
          <button
            onClick={async () => {
              if (!recordedVideoURL) {
                alert("⚠️ Please record something first.");
                return;
              }

              disableLiveTrackingRef.current = true;
              if (cameraRef.current) await cameraRef.current.stop();

              const video = document.getElementById("playbackVideo");
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");
              const holistic = holisticRef.current;

              if (!video || !canvas || !ctx || !holistic) return;

              video.currentTime = 0;
              await video.play();

              const interval = setInterval(async () => {
                if (video.ended) {
                  clearInterval(interval);
                  console.log("✅ Tracked full video");
                  disableLiveTrackingRef.current = false;
                  if (cameraRef.current) await cameraRef.current.start();
                  return;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                try {
                  await holistic.send({ image: canvas });
                } catch (e) {
                  console.error("❌ holistic.send failed on recorded:", e);
                }
              }, 100);
            }}
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: "6px",
              marginBottom: "10px",
              border: "none",
              width: "100%",
            }}
          >
            Record Poses
          </button>
        </div>
      </div>

      {/* Right Panel - Robot Viewer */}
      <div style={{ flex: 2, padding: "10px" }}>
        <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <OrbitControls />
          {robotModel && <RobotAnimator object={robotModel} />}
        </Canvas>
      </div>

      {/* Bottom Right - Video Preview */}
      {recordedVideoURL && (
        <div style={{ position: "absolute", bottom: "20px", right: "20px" }}>
          <h4 style={{ color: "#fff" }}>🎬 Recorded Video</h4>
          <video
            id="playbackVideo"
            src={recordedVideoURL}
            controls
            width="320"
            style={{ border: "2px solid #fff", borderRadius: "8px" }}
          />
        </div>
      )}

      {/* Save + Download */}
      {/* {recordedVideoURL && (
        <button
          onClick={uploadRecordingToServer}
          style={{
            backgroundColor: "#6f42c1",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "none",
            width: "100%",
          }}
        >
          💾 Save to Database
        </button>
      )} */}

      <hr style={{ border: "1px solid #444", margin: "10px 0" }} />

      {/* Previous Recordings */}
      <h6 style={{ marginBottom: "10px", color: "#ccc" }}>
        📂 Previous Recordings
      </h6>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {recordings.length === 0 ? (
          <li style={{ color: "#888" }}>No recordings found.</li>
        ) : (
          recordings.map((rec) => (
            <li key={rec._id} style={{ marginBottom: "8px" }}>
              <button
                onClick={() => loadRecording(rec._id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #555",
                  backgroundColor: "#2c2f4a",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                📄 {rec.name}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function RobotAnimator({ object }) {
  useFrame(() => {
    if (object) {
      object.updateMatrixWorld(true); // force refresh of transforms
    }
  });
  return <primitive object={object} />;
}
