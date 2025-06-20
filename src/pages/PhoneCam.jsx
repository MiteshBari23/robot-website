import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const NODE_SERVER_URL = "https://website-and-cloudgame-2.onrender.com";
const PHONE_DEVICE_ID = `phone-${Math.random().toString(36).substring(7)}`;

const PhoneCam = () => {
    const localVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const socket = useRef(null);

    const [status, setStatus] = useState("Connecting to server...");

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

        socket.current.on("start_webrtc_offer", async ({ requestingLaptopSocketId }) => {
            setStatus("Laptop requested stream. Setting up WebRTC...");
            await setupPeerConnection(requestingLaptopSocketId);
        });

        socket.current.on("sdp_answer_from_laptop", async (sdpAnswer) => {
            setStatus("Received SDP Answer. Establishing connection...");
            if (peerConnection.current && peerConnection.current.remoteDescription === null) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdpAnswer));
                console.log("Phone: Remote description set (Answer).");
            }
        });

        socket.current.on("ice_candidate_from_laptop", async (candidate) => {
            if (peerConnection.current && candidate) {
                await peerConnection.current.addIceCandidate(candidate);
                console.log("Phone: Added remote ICE candidate.");
            }
        });

        socket.current.on("disconnect", () => {
            setStatus("Disconnected from server.");
            console.log("Phone: Disconnected from server.");
        });

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
    }, []);

    const setupPeerConnection = async (requestingLaptopSocketId) => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnection.current = pc;

        pc.oniceconnectionstatechange = () => {
            console.log('Phone ICE connection state:', pc.iceConnectionState);
            setStatus(`ICE State: ${pc.iceConnectionState}`);
        };

        if (localVideoRef.current && localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => pc.addTrack(track, localVideoRef.current.srcObject));
            console.log("Phone: Local stream added to PeerConnection.");
        } else {
            console.error("Phone: No local stream found to add to PeerConnection.");
            setStatus("Error: No local stream to start WebRTC.");
            return;
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Phone: Sending ICE candidate to laptop.");
                socket.current.emit("ice_candidate_from_phone", {
                    candidate: event.candidate,
                    phoneDeviceId: PHONE_DEVICE_ID,
                    requestingLaptopSocketId
                });
            }
        };

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log("Phone: Sending SDP Offer to laptop.");
            socket.current.emit("sdp_offer_from_phone", {
                sdpOffer: offer,
                phoneDeviceId: PHONE_DEVICE_ID,
                requestingLaptopSocketId
            });
            setStatus("Offer sent. Waiting for answer...");
        } catch (error) {
            console.error("Phone: Error creating or sending offer:", error);
            setStatus(`Error setting up WebRTC: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>📱 Phone Camera Stream</h2>
            <p>Status: {status}</p>
            <p>Your Device ID: {PHONE_DEVICE_ID}</p>
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                width="320"
                height="240"
                style={{ border: '1px solid gray' }}
            />
        </div>
    );
};

export default PhoneCam;
