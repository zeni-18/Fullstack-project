import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

const VideoPlayer = ({ src, poster, className = '' }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleProgressClick = (e) => {
        const video = videoRef.current;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={`video-container ${className}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="video-player"
                onClick={togglePlay}
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div
                    onClick={togglePlay}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        width: '64px',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Play size={32} color="white" fill="white" />
                </div>
            )}

            {/* Video Controls */}
            <div
                className="video-controls"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    padding: 'var(--spacing-md)',
                    opacity: showControls || !isPlaying ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            >
                {/* Progress Bar */}
                <div
                    className="video-progress"
                    onClick={handleProgressClick}
                    style={{
                        width: '100%',
                        height: '4px',
                        background: 'rgba(255,255,255,0.3)',
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer',
                        marginBottom: 'var(--spacing-sm)',
                        position: 'relative'
                    }}
                >
                    <div
                        className="video-progress-bar"
                        style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'var(--primary)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.1s linear'
                        }}
                    />
                </div>

                {/* Control Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <button
                        onClick={togglePlay}
                        style={{ color: 'white', padding: '4px' }}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                        onClick={toggleMute}
                        style={{ color: 'white', padding: '4px' }}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>

                    <span style={{ color: 'white', fontSize: '0.875rem', marginLeft: 'auto' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <button
                        onClick={toggleFullscreen}
                        style={{ color: 'white', padding: '4px' }}
                    >
                        <Maximize size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
