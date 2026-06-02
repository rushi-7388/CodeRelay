import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../lib/socket";
import toast from "react-hot-toast";

export default function useCustomSession(sessionId, user) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map()); // userId -> MediaStream
    const peersRef = useRef(new Map()); // userId -> RTCPeerConnection
    const localStreamRef = useRef(null);
    useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

    // Whenever localStream updates after initial mount, ensure it's added to peers
    // In a robust implementation we'd use replaceTrack
    const createPeer = useCallback((targetUserId, stream, initiator) => {
        // 1. Create connection
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" }
            ],
        });

        peersRef.current.set(targetUserId, peer);

        // 2. Add local stream to connection
        if (stream) {
            stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        }

        // 3. Handle stream received from remote
        peer.onontrack = (event) => {
            setRemoteStreams((prev) => {
                const next = new Map(prev);
                // The event streams should contain the remote stream.
                next.set(targetUserId, event.streams[0]);
                return next;
            });
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc-signal", {
                    targetUserId,
                    type: "ice-candidate",
                    signalData: event.candidate,
                    roomId: sessionId,
                });
            }
        };

        if (initiator) {
            peer.createOffer()
                .then((offer) => {
                    return peer.setLocalDescription(offer);
                })
                .then(() => {
                    socket.emit("webrtc-signal", {
                        targetUserId,
                        type: "offer",
                        signalData: peer.localDescription,
                        roomId: sessionId,
                    });
                })
                .catch((err) => console.error("Error creating offer", err));
        }

        return peer;
    }, [sessionId]);

    // Initialize socket connection and media devices
    useEffect(() => {
        if (!user || !sessionId) return;
        const peers = peersRef.current;
        let isMounted = true;

        // Connect socket
        socket.connect();

        socket.on("connect", () => {
            setIsConnected(true);
            // Authenticate
            socket.emit("authenticate", {
                userId: user.id,
                userName: user.fullName || user.username,
                userImage: user.imageUrl,
            });

            // Join room
            socket.emit("join-room", sessionId);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("room-state", ({ users }) => {
            setRoomUsers(users);
        });

        socket.on("user-joined", ({ userId, users }) => {
            if (userId !== user.id) {
                toast.success("A participant joined");
            }
            setRoomUsers(users);
            // Being the existing member, we will NOT create the offer immediately.
            // Usually, the newly joined member creates the offer. Wait, if everyone creates an offer, we get a race condition.
            // Convention: User who just joined creates an offer to everyone else already in the room. Wait, no. The 'polite' way: The users already in the room who receive 'user-joined' will create Offers to the new user.
            if (userId !== user.id && localStreamRef.current) {
                createPeer(userId, localStreamRef.current, true);
            }
        });

        socket.on("user-left", ({ userId, users }) => {
            toast("A participant left");
            setRoomUsers(users);
            if (peersRef.current.has(userId)) {
                peersRef.current.get(userId).close();
                peersRef.current.delete(userId);
            }
            setRemoteStreams((prev) => {
                const next = new Map(prev);
                next.delete(userId);
                return next;
            });
        });

        socket.on("chat-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("webrtc-signal", async (data) => {
            const { senderId, type, signalData } = data;
            let peer = peersRef.current.get(senderId);

            if (!peer) {
                // So we create the peer connection
                peer = createPeer(senderId, localStreamRef.current, false);
            }

            if (type === "offer") {
                await peer.setRemoteDescription(new RTCSessionDescription(signalData));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit("webrtc-signal", {
                    targetUserId: senderId,
                    type: "answer",
                    signalData: answer,
                    roomId: sessionId,
                });
            } else if (type === "answer") {
                await peer.setRemoteDescription(new RTCSessionDescription(signalData));
            } else if (type === "ice-candidate") {
                try {
                    await peer.addIceCandidate(new RTCIceCandidate(signalData));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            }
        });

        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (isMounted) {
                    setLocalStream(stream);
                }
            } catch (err) {
                console.error("Failed to get local stream", err);
                toast.error("Could not access camera/microphone");
            }
        };

        initMedia();

        return () => {
            isMounted = false;

            socket.off("connect");
            socket.off("disconnect");
            socket.off("room-state");
            socket.off("user-joined");
            socket.off("user-left");
            socket.off("chat-message");
            socket.off("webrtc-signal");

            socket.disconnect();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            peers.forEach((peer) => peer.close());
            peers.clear();
        };
    }, [user, sessionId, createPeer]); // CRITICAL: Removed localStream from dependencies to stop reconnect loop

    // Separate effect to sync tracks if localStream changes (e.g. initial load)
    useEffect(() => {
        if (!localStream) return;
        
        peersRef.current.forEach((peer) => {
            // Check if track is already added
            const senders = peer.getSenders();
            localStream.getTracks().forEach((track) => {
                const alreadyAdded = senders.find((s) => s.track === track);
                if (!alreadyAdded) {
                    peer.addTrack(track, localStream);
                }
            });
        });
    }, [localStream]);



    const sendMessage = (text) => {
        socket.emit("chat-message", {
            roomId: sessionId,
            message: text,
            type: "message",
        });
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                socket.emit("media-status-change", {
                    roomId: sessionId,
                    videoEnabled: videoTrack.enabled,
                    audioEnabled: localStream.getAudioTracks()[0]?.enabled || false
                });
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                socket.emit("media-status-change", {
                    roomId: sessionId,
                    videoEnabled: localStream.getVideoTracks()[0]?.enabled || false,
                    audioEnabled: audioTrack.enabled
                });
            }
        }
    };

    return {
        isConnected,
        socket,
        messages,
        sendMessage,
        roomUsers,
        localStream,
        remoteStreams,
        toggleVideo,
        toggleAudio
    };
}
