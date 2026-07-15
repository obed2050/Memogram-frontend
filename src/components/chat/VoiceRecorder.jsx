import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';
import { cn } from '../../utils';

const MAX_DURATION = 300;
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [waveformBars, setWaveformBars] = useState(Array(28).fill(0.2));
  const [phase, setPhase] = useState('recording'); // 'recording' | 'preview'
  const [previewAudio, setPreviewAudio] = useState(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const previewAudioRef = useRef(null);
  const previewAnimRef = useRef(null);
  const blobRef = useRef(null);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(100);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const drawWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = 28;
        const step = Math.floor(dataArray.length / bars);
        const newBars = [];
        for (let i = 0; i < bars; i++) {
          const val = dataArray[i * step] / 255;
          newBars.push(Math.max(0.15, val));
        }
        setWaveformBars(newBars);
        animFrameRef.current = requestAnimationFrame(drawWaveform);
      };
      drawWaveform();
    } catch {
      onCancel();
    }
  }, [onCancel]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }

    setIsPaused(false);

    const buildBlob = () => {
      const blob = new Blob(chunksRef.current, { type: recorder?.mimeType || 'audio/webm' });
      if (blob.size === 0 || blob.size > MAX_SIZE_BYTES) {
        onCancel();
        return;
      }
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setPreviewAudio(url);
      setPhase('preview');

      // Get duration of preview
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.addEventListener('loadedmetadata', () => {
        setPreviewDuration(audio.duration || elapsed);
      });
    };

    if (recorder?.state === 'recording') {
      recorder.onstop = buildBlob;
    } else {
      buildBlob();
    }
  }, [onCancel, elapsed]);

  const togglePause = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (isPaused) {
      recorder.resume();
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      setIsPaused(false);
    } else {
      recorder.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  // Preview controls
  const togglePreviewPlay = useCallback(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setPreviewPlaying(true);
      const update = () => {
        if (audio.paused) {
          setPreviewPlaying(false);
          return;
        }
        setPreviewTime(audio.currentTime);
        previewAnimRef.current = requestAnimationFrame(update);
      };
      previewAnimRef.current = requestAnimationFrame(update);
    }
  }, [previewPlaying]);

  const handleConfirmSend = () => {
    if (blobRef.current) {
      const file = new File([blobRef.current], `voice-${Date.now()}.webm`, { type: blobRef.current.type });
      onSend(file, elapsed);
    }
    cleanupPreview();
  };

  const handleRetake = () => {
    cleanupPreview();
    setElapsed(0);
    setWaveformBars(Array(28).fill(0.2));
    setPhase('recording');
    chunksRef.current = [];
    startRecording();
  };

  const cleanupPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = '';
      previewAudioRef.current = null;
    }
    if (previewAnimRef.current) cancelAnimationFrame(previewAnimRef.current);
    if (previewAudio) URL.revokeObjectURL(previewAudio);
    setPreviewAudio(null);
    setPreviewPlaying(false);
    setPreviewTime(0);
    setPreviewDuration(0);
    blobRef.current = null;
  };

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (previewAnimRef.current) cancelAnimationFrame(previewAnimRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      cleanupPreview();
    };
  }, []);

  const progress = phase === 'recording'
    ? Math.min(elapsed / MAX_DURATION, 1)
    : previewDuration > 0 ? previewTime / previewDuration : 0;
  const remaining = MAX_DURATION - elapsed;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-dark-surface rounded-xl mb-2 border border-dark-border">
        <button
          onClick={phase === 'preview' ? handleRetake : onCancel}
          className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
        >
          <HiXMark className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'w-2.5 h-2.5 rounded-full',
            phase === 'preview'
              ? 'bg-blue-400'
              : isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'
          )} />
          <span className="text-sm font-mono text-white tabular-nums">
            {phase === 'preview' ? formatTime(previewTime || previewDuration) : formatTime(elapsed)}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-[2px] h-8 overflow-hidden">
          {waveformBars.map((val, i) => {
            const barProgress = i / waveformBars.length;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(12, val * 100)}%`,
                  backgroundColor: isActive
                    ? (phase === 'preview' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(244, 197, 66, 0.9)')
                    : (phase === 'preview' ? 'rgba(59, 130, 246, 0.2)' : val > 0.5
                      ? `rgba(244, 197, 66, ${0.6 + val * 0.4})`
                      : `rgba(140, 108, 255, ${0.3 + val * 0.5})`),
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-gray-500 font-mono tabular-nums">
            {phase === 'preview' ? formatTime(Math.max(0, previewDuration - previewTime)) : formatTime(remaining)}
          </span>
        </div>

        {phase === 'recording' ? (
          <>
            <button
              onClick={togglePause}
              className={cn(
                'p-2 rounded-full transition-colors cursor-pointer shrink-0',
                isPaused
                  ? 'text-yellow-400 hover:bg-yellow-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              )}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
            </button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="p-2.5 rounded-full bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer shrink-0"
              title="Stop & Preview"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </motion.button>
          </>
        ) : (
          <>
            <button
              onClick={togglePreviewPlay}
              className={cn(
                'p-2 rounded-full transition-colors cursor-pointer shrink-0',
                'text-blue-400 hover:bg-blue-500/10'
              )}
              title={previewPlaying ? 'Pause' : 'Play'}
            >
              {previewPlaying ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              )}
            </button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleConfirmSend}
              className="p-2.5 rounded-full bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer shrink-0"
              title="Send"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </motion.button>
          </>
        )}
      </div>

      <div className="h-1 rounded-full overflow-hidden bg-dark-surface mx-4 mb-2">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: phase === 'preview'
              ? 'linear-gradient(to right, #3B82F6, #60A5FA)'
              : 'linear-gradient(to right, #F4C542, #8C6CFF)',
          }}
        />
      </div>

      {phase === 'preview' && (
        <div className="flex justify-center gap-3 mx-4 mb-2">
          <button
            onClick={handleRetake}
            className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-dark-card border border-dark-border rounded-lg transition-colors cursor-pointer"
          >
            Retake
          </button>
          <button
            onClick={handleConfirmSend}
            className="px-4 py-1.5 text-xs font-medium text-dark bg-primary rounded-lg transition-colors cursor-pointer hover:bg-primary-light"
          >
            Send Voice Message
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default VoiceRecorder;
