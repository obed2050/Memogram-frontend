import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

const SPEEDS = [1, 1.5, 2];

const VoiceMessage = ({ audioUrl, duration, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [waveformData, setWaveformData] = useState(null);
  const audioRef = useRef(null);
  const animRef = useRef(null);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onLoaded = () => {
      setTotalDuration(audio.duration || duration || 0);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {};

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, duration]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';

    const genWaveform = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audio.addEventListener('canplaythrough', () => {
          const source = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          analyser.connect(ctx.destination);

          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const bars = 32;
          const step = Math.floor(data.length / bars);
          const result = [];
          for (let i = 0; i < bars; i++) {
            result.push((data[i * step] || 0) / 255);
          }
          setWaveformData(result);
          ctx.close();
        }, { once: true });
        audio.load();
      } catch {}
    };

    genWaveform();
    return () => { audio.src = ''; };
  }, [audioUrl]);

  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    const update = () => {
      setCurrentTime(audioRef.current?.currentTime || 0);
      animRef.current = requestAnimationFrame(update);
    };
    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const cycleSpeed = () => {
    setSpeed((prev) => {
      const idx = SPEEDS.indexOf(prev);
      return SPEEDS[(idx + 1) % SPEEDS.length];
    });
  };

  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  const bars = waveformData || Array(32).fill(0.2);

  return (
    <div className="flex items-center gap-3 min-w-[240px]">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer',
          isOwn
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-primary/15 hover:bg-primary/25 text-primary-light'
        )}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        )}
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 h-7 mb-1">
          {bars.map((val, i) => {
            const barProgress = i / bars.length;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(15, (val || 0.15) * 100)}%`,
                  backgroundColor: isActive
                    ? (isOwn ? 'rgba(255,255,255,0.8)' : 'rgba(244,197,66,0.9)')
                    : (isOwn ? 'rgba(255,255,255,0.25)' : 'rgba(140,108,255,0.3)'),
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className={cn('text-[10px] font-mono tabular-nums', isOwn ? 'text-white/60' : 'text-gray-500')}>
            {formatTime(currentTime)}
          </span>

          <button
            onClick={cycleSpeed}
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer',
              isOwn
                ? 'text-white/60 hover:text-white/80'
                : 'text-primary/60 hover:text-primary-light'
            )}
          >
            {speed}x
          </button>

          <span className={cn('text-[10px] font-mono tabular-nums', isOwn ? 'text-white/60' : 'text-gray-500')}>
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessage;
