import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPhone, HiVideoCamera, HiXMark, HiMicrophone, HiNoSymbol,
  HiVideoCameraSlash, HiSpeakerWave, HiSpeakerXMark, HiArrowsPointingOut,
  HiMiniStopCircle,
} from 'react-icons/hi2';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils';

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const CallModal = ({ isOpen, onClose, callType: initialCallType, otherUser, conversationId }) => {
  const socket = useSocket();
  const { user } = useAuth();

  const [callState, setCallState] = useState('idle'); // idle, ringing, incoming, connected, ended
  const [callType, setCallType] = useState(initialCallType || 'voice');
  const [callId, setCallId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(initialCallType === 'voice');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const timerRef = useRef(null);
  const incomingDataRef = useRef(null);
  const endCallRef = useRef(null);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = useCallback(() => {
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Get user media
  const getLocalStream = useCallback(async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Failed to get media:', err);
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && callId) {
        const targetId = otherUser?.id || incomingCall?.caller?.id;
        socket.emit('call_signal', {
          callId,
          signal: { type: 'candidate', candidate: event.candidate },
          targetUserId: targetId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCallRef.current?.();
      }
    };

    return pc;
  }, [socket, callId, otherUser, incomingCall]);

  // Initiate call (caller side)
  const initiateCall = useCallback(async (type) => {
    setCallType(type);
    setIsVideoOff(type === 'voice');

    const stream = await getLocalStream(type === 'video');
    if (!stream) {
      setCallState('idle');
      return;
    }

    const pc = createPeerConnection(stream);
    setCallState('ringing');

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const callData = {
        receiverId: otherUser.id,
        conversationId,
        callType: type,
        offer,
      };

      socket.emit('call_initiate', callData);
    } catch (err) {
      console.error('Failed to create offer:', err);
      endCall();
    }
  }, [getLocalStream, createPeerConnection, otherUser, conversationId, socket]);

  // Handle incoming call (receiver side)
  const handleIncomingCall = useCallback(async (data) => {
    if (callState !== 'idle') {
      socket.emit('call_reject', { callId: data.callId, callerId: data.caller.id });
      return;
    }

    setCallType(data.callType);
    setCallId(data.callId);
    setIncomingCall(data);
    setCallState('incoming');
    setIsVideoOff(data.callType === 'voice');
  }, [callState, socket]);

  // Accept call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    const stream = await getLocalStream(incomingCall.callType === 'video');
    if (!stream) {
      rejectCall();
      return;
    }

    const pc = createPeerConnection(stream);
    setCallState('connected');
    startTimer();

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('call_accept', {
        callId: incomingCall.callId,
        callerId: incomingCall.caller.id,
        answer,
      });
    } catch (err) {
      console.error('Failed to accept call:', err);
      endCall();
    }

    setIncomingCall(null);
  }, [incomingCall, getLocalStream, createPeerConnection, startTimer, socket]);

  // Reject call
  const rejectCall = useCallback(() => {
    if (incomingCall) {
      socket.emit('call_reject', {
        callId: incomingCall.callId,
        callerId: incomingCall.caller.id,
      });
      setIncomingCall(null);
    }
    cleanup();
    setCallState('idle');
  }, [incomingCall, socket]);

  // End call
  const endCall = useCallback(() => {
    if (callId) {
      const otherUserId = incomingCall?.caller?.id || otherUser?.id;
      socket.emit('call_end', { callId, otherUserId });
    }
    cleanup();
    setCallState('idle');
    setCallId(null);
    setDuration(0);
    setIncomingCall(null);
    onClose?.();
  }, [callId, incomingCall, otherUser, socket, onClose]);

  // Keep ref in sync
  endCallRef.current = endCall;

  // Cleanup
  const cleanup = useCallback(() => {
    stopTimer();
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsMuted(false);
    setIsVideoOff(initialCallType === 'voice');
    setIsSpeakerOn(false);
    setIsFullscreen(false);
    setIsScreenSharing(false);
  }, [stopTimer, initialCallType]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (isVideoOff) {
      const stream = await getLocalStream(true);
      if (stream && peerConnectionRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
      setIsVideoOff(false);
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((t) => {
          t.enabled = false;
          t.stop();
        });
      }
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(null);
        }
      }
      setIsVideoOff(true);
    }
  }, [isVideoOff, getLocalStream]);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(!isSpeakerOn);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing, go back to camera
      const stream = await getLocalStream(true);
      if (stream && peerConnectionRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch {}
    }
  }, [isScreenSharing, getLocalStream]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleCallIncoming = (data) => handleIncomingCall(data);

    const handleCallAccepted = async (data) => {
      if (data.answer && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          setCallState('connected');
          startTimer();
        } catch (err) {
          console.error('Failed to set remote description:', err);
        }
      }
    };

    const handleCallRejected = () => {
      cleanup();
      setCallState('idle');
      setCallId(null);
    };

    const handleCallEnded = () => {
      cleanup();
      setCallState('idle');
      setCallId(null);
      setDuration(0);
      onClose?.();
    };

    const handleCallSignal = async (data) => {
      if (!peerConnectionRef.current) return;
      try {
        if (data.signal.type === 'offer') {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.signal)
          );
        } else if (data.signal.type === 'answer') {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.signal)
          );
        } else if (data.signal.type === 'candidate') {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.signal.candidate)
          );
        }
      } catch (err) {
        console.error('Signal error:', err);
      }
    };

    const handleCallCancelled = () => {
      cleanup();
      setCallState('idle');
      setCallId(null);
    };

    const handleCallInitiated = (data) => {
      if (data.callId) {
        setCallId(data.callId);
      }
    };

    socket.on('call_incoming', handleCallIncoming);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_signal', handleCallSignal);
    socket.on('call_cancelled', handleCallCancelled);
    socket.on('call_initiated', handleCallInitiated);

    return () => {
      socket.off('call_incoming', handleCallIncoming);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_signal', handleCallSignal);
      socket.off('call_cancelled', handleCallCancelled);
      socket.off('call_initiated', handleCallInitiated);
    };
  }, [socket, isOpen, handleIncomingCall, startTimer, cleanup, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  if (!isOpen) return null;

  const isConnected = callState === 'connected';
  const isRinging = callState === 'ringing';
  const isIncomingCall = callState === 'incoming';
  const isVideo = callType === 'video';
  const displayUser = isIncomingCall ? incomingCall?.caller : otherUser;

  // Don't render if idle and no incoming call
  if (callState === 'idle' && !isIncomingCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(11, 11, 12, 0.97)' }}
      >
        {/* Video Layout for connected video calls */}
        {isConnected && isVideo ? (
          <div className="absolute inset-0 flex flex-col">
            {/* Remote Video (full screen) */}
            <div className="flex-1 relative bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteStreamRef.current && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar src={displayUser?.profilePhoto} name={displayUser?.fullName} size="lg" />
                </div>
              )}
            </div>

            {/* Local Video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 md:w-40 md:h-32 rounded-xl overflow-hidden border-2 border-dark-border shadow-xl z-10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Call Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm text-white/70 font-mono">{formatTime(duration)}</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <ControlBtn
                  icon={isMuted ? HiNoSymbol : HiMicrophone}
                  onClick={toggleMute}
                  active={isMuted}
                  label={isMuted ? 'Unmute' : 'Mute'}
                />
                <ControlBtn
                  icon={isVideoOff ? HiVideoCameraSlash : HiVideoCamera}
                  onClick={toggleVideo}
                  active={isVideoOff}
                  label={isVideoOff ? 'Show Camera' : 'Hide Camera'}
                />
                <ControlBtn
                  icon={HiArrowsPointingOut}
                  onClick={toggleFullscreen}
                  label="Fullscreen"
                />
                <EndCallBtn onClick={endCall} />
              </div>
            </div>
          </div>
        ) : (
          /* Non-video layout (voice call, ringing, incoming) */
          <div className="flex flex-col items-center justify-center gap-8 p-8 max-w-sm w-full">
            {/* Caller/Callee Info */}
            <div className="relative">
              <motion.div
                animate={isRinging || isIncomingCall ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(244,197,66,0.3), rgba(108,60,240,0.3))',
                  filter: 'blur(20px)',
                  transform: 'scale(1.5)',
                }}
              />
              {isRinging && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-primary/40"
                    style={{ margin: '-16px' }}
                  />
                  <motion.div
                    animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    className="absolute inset-0 rounded-full border border-primary/20"
                    style={{ margin: '-32px' }}
                  />
                </>
              )}
              <Avatar src={displayUser?.profilePhoto} name={displayUser?.fullName} size="lg" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">{displayUser?.fullName}</h3>
              <p className="text-sm text-gray-400">
                {isRinging && 'Calling...'}
                {isIncomingCall && `${incomingCall?.callType === 'video' ? 'Video' : 'Voice'} Call`}
                {isConnected && formatTime(duration)}
                {callState === 'ended' && 'Call Ended'}
              </p>
            </div>

            {/* Incoming Call Actions */}
            {isIncomingCall && (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={rejectCall}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center cursor-pointer shadow-lg shadow-red-500/30"
                  >
                    <HiPhone className="w-7 h-7 text-white rotate-[135deg]" />
                  </motion.button>
                  <span className="text-xs text-gray-400">Decline</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={acceptCall}
                    className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center cursor-pointer shadow-lg shadow-green-500/30"
                  >
                    <HiPhone className="w-7 h-7 text-white" />
                  </motion.button>
                  <span className="text-xs text-gray-400">Accept</span>
                </div>
              </div>
            )}

            {/* Connected Voice Controls */}
            {isConnected && !isVideo && (
              <div className="flex items-center gap-4">
                <ControlBtn
                  icon={isMuted ? HiNoSymbol : HiMicrophone}
                  onClick={toggleMute}
                  active={isMuted}
                  label={isMuted ? 'Unmute' : 'Mute'}
                />
                <ControlBtn
                  icon={isSpeakerOn ? HiSpeakerWave : HiSpeakerXMark}
                  onClick={toggleSpeaker}
                  active={isSpeakerOn}
                  label={isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
                />
                <EndCallBtn onClick={endCall} />
              </div>
            )}

            {/* Ringing Cancel */}
            {isRinging && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center cursor-pointer shadow-lg shadow-red-500/30"
              >
                <HiPhone className="w-7 h-7 text-white rotate-[135deg]" />
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const ControlBtn = ({ icon: Icon, onClick, active, label }) => (
  <div className="flex flex-col items-center gap-1">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer',
        active
          ? 'bg-white/20 text-white'
          : 'bg-dark-surface/80 text-gray-300 hover:bg-dark-surface'
      )}
      title={label}
    >
      <Icon className="w-6 h-6" />
    </motion.button>
    <span className="text-[10px] text-gray-400">{label}</span>
  </div>
);

const EndCallBtn = ({ onClick }) => (
  <div className="flex flex-col items-center gap-1">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center cursor-pointer shadow-lg shadow-red-500/30"
      title="End Call"
    >
      <HiMiniStopCircle className="w-8 h-8 text-white" />
    </motion.button>
    <span className="text-[10px] text-gray-400">End</span>
  </div>
);

export default CallModal;