import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// IMPORTANT: Replace with your deployed Node.js server URL if it's different
const NODE_SERVER_URL = "http://192.168.148.149:3000";
const PHONE_DEVICE_ID = `phone-${Math.random().toString(36).substring(7)}`;

const PhoneCam = () => {
    const localVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const socket = useRef(null);

    const [status, setStatus] = useState("Connecting to server...");

    // This useEffect handles Socket.IO connections and events
    useEffect(() => {
        socket.current = io(NODE_SERVER_URL);

        socket.current.on("connect", () => {
            setStatus("Connected to server. Registering phone...");
            socket.current.emit("register_phone", PHONE_DEVICE_ID);
        });

        socket.current.on("connect_error", (err) => {
            console.error("Socket.IO Connect Error:", err);
            setStatus(`Connection Error: ${err.message}`);
        });

        // Event: Laptop requests a WebRTC offer from this phone
        socket.current.on("start_webrtc_offer", async ({ requestingLaptopSocketId }) => {
            setStatus("Laptop requested stream. Setting up WebRTC...");
            await setupPeerConnection(requestingLaptopSocketId);
        });

        // Event: Laptop sends its SDP Answer
        socket.current.on("sdp_answer_from_laptop", async (sdpAnswer) => {
            setStatus("Received SDP Answer. Establishing connection...");
            if (peerConnection.current && peerConnection.current.remoteDescription === null) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdpAnswer));
                console.log("Phone: Remote description set (Answer).");
            }
        });

        // Event: Laptop sends its ICE Candidates
        socket.current.on("ice_candidate_from_laptop", async (candidate) => {
            if (peerConnection.current && candidate) {
                await peerConnection.current.addIceCandidate(candidate);
                console.log("Phone: Added remote ICE candidate.");
            }
        });

        // Event: Control command received from laptop
        socket.current.on("control", (cmd) => {
            setStatus(`Command received: ${cmd}`);
            const char = document.getElementById("character");
            if (!char) return;

            const currentLeft = parseInt(char.style.left || "140");

            if (cmd === "left") {
                char.style.left = Math.max(currentLeft - 20, 0) + "px";
            } else if (cmd === "right") {
                char.style.left = Math.min(currentLeft + 20, 280) + "px";
            } else if (cmd === "jump") {
                char.style.transition = "bottom 0.3s ease-out";
                char.style.bottom = "100px";
                setTimeout(() => {
                    char.style.bottom = "10px";
                }, 300);
            }
        });

        socket.current.on("disconnect", () => {
            setStatus("Disconnected from server.");
            console.log("Phone: Disconnected from server.");
        });

        // Function to get local camera stream
        const getLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                return stream;
            } catch (err) {
                setStatus(`Camera access denied or unavailable: ${err.message}`);
                console.error("Camera error:", err);
                alert("Camera access denied or unavailable. Please allow camera permissions.");
                return null;
            }
        };

        let localStream = null;
        getLocalStream().then(stream => {
            localStream = stream;
        });

        // Cleanup on unmount
        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // This function sets up the RTCPeerConnection and handles SDP/ICE
    const setupPeerConnection = async (requestingLaptopSocketId) => {
        // Close existing PC if any
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ]
        });
        peerConnection.current = pc; // Store in ref

        // WebRTC: Log ICE connection state changes
        pc.oniceconnectionstatechange = () => {
            console.log('Phone ICE connection state:', pc.iceConnectionState);
            // You might want to update a visible status on the phone's UI as well
            setStatus(`ICE State: ${pc.iceConnectionState}`);
        };


        // Add local camera stream to the peer connection
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => pc.addTrack(track, localVideoRef.current.srcObject));
            console.log("Phone: Local stream added to PeerConnection.");
        } else {
            console.error("Phone: No local stream found to add to PeerConnection.");
            setStatus("Error: No local stream to start WebRTC.");
            return;
        }

        // Event: When ICE candidates are generated, send them to laptop via signaling server
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Phone: Sending ICE candidate to laptop.");
                socket.current.emit("ice_candidate_from_phone", {
                    candidate: event.candidate,
                    phoneDeviceId: PHONE_DEVICE_ID,
                    requestingLaptopSocketId: requestingLaptopSocketId
                });
            }
        };

        try {
            // Create and send SDP Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log("Phone: Sending SDP Offer to laptop.");
            socket.current.emit("sdp_offer_from_phone", {
                sdpOffer: offer,
                phoneDeviceId: PHONE_DEVICE_ID,
                requestingLaptopSocketId: requestingLaptopSocketId
            });
            setStatus("Offer sent. Waiting for answer...");
        } catch (error) {
            console.error("Phone: Error creating or sending offer:", error);
            setStatus(`Error setting up WebRTC: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>📱 Phone Camera & Character</h2>
            <p>Status: {status}</p>
            <p>Your Device ID: {PHONE_DEVICE_ID}</p>
            <video ref={localVideoRef} autoPlay playsInline muted width="320" height="240" style={{ border: '1px solid gray' }} />

            {/* Character Container */}
            <div
                style={{
                    position: "relative",
                    width: "320px",
                    height: "240px",
                    backgroundColor: "#eee",
                    marginTop: "10px",
                    overflow: "hidden", // Ensures character stays within bounds
                }}
            >
                <div
                    id="character"
                    style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "blue",
                        borderRadius: "50%",
                        position: "absolute",
                        bottom: "10px",
                        left: "140px", // Centered horizontally
                        transition: "left 0.3s ease-out, bottom 0.3s ease-out",
                    }}
                ></div>
            </div>
        </div>
    );
};

export default PhoneCam;