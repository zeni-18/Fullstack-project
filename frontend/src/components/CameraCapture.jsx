import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Square, X, RefreshCw, Download, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraCapture = ({ onCapture, onClose, mode: initialMode = 'image' }) => {
    const [mode, setMode] = useState(initialMode); // 'image' or 'video'
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
    const [capturedBlob, setCapturedBlob] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [facingMode]);

    const startCamera = async () => {
        stopCamera();
        try {
            const constraints = {
                video: { facingMode: facingMode },
                audio: mode === 'video'
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please ensure permissions are granted.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleFacingMode = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            setCapturedBlob(blob);
            setPreviewUrl(url);
            stopCamera();
        }, 'image/jpeg', 0.9);
    };

    const startRecording = () => {
        chunksRef.current = [];
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
        }

        try {
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/mp4' }); // Simplified type for backend
                const url = URL.createObjectURL(blob);
                setCapturedBlob(blob);
                setPreviewUrl(url);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error starting recorder:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            stopCamera();
        }
    };

    const handleConfirm = () => {
        if (capturedBlob) {
            const fileName = mode === 'image' ? `capture_${Date.now()}.jpg` : `capture_${Date.now()}.mp4`;
            const file = new File([capturedBlob], fileName, {
                type: mode === 'image' ? 'image/jpeg' : 'video/mp4'
            });
            onCapture(file);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'black',
                zIndex: 3000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Header */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 10
            }}>
                <button type="button" onClick={onClose} style={{ color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px' }}>
                    <X size={24} />
                </button>

                {previewUrl && (
                    <button type="button" onClick={() => {
                        setPreviewUrl(null);
                        setCapturedBlob(null);
                        startCamera();
                    }} style={{ color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-full)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={18} /> Retake
                    </button>
                )}
            </div>

            {/* Preview/Video Container */}
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111'
            }}>
                {previewUrl ? (
                    mode === 'image' ? (
                        <img src={previewUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Captured" />
                    ) : (
                        <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                        }}
                    />
                )}
            </div>

            {/* Controls */}
            {!previewUrl && (
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    zIndex: 10
                }}>
                    {isRecording && (
                        <div style={{
                            backgroundColor: 'rgba(255,0,0,0.8)',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white', animation: 'pulse 1s infinite' }} />
                            {formatTime(recordingTime)}
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <button
                            type="button"
                            onClick={toggleFacingMode}
                            style={{ color: 'white', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '12px' }}
                        >
                            <RefreshCw size={24} />
                        </button>

                        {mode === 'image' ? (
                            <button
                                type="button"
                                onClick={takePhoto}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    border: '4px solid white',
                                    backgroundColor: 'white',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                                    cursor: 'pointer'
                                }}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    border: '4px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                                    cursor: 'pointer'
                                }}
                            >
                                {isRecording ? (
                                    <Square size={32} color="#ff3b30" fill="#ff3b30" />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff3b30' }} />
                                )}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setMode(prev => prev === 'image' ? 'video' : 'image')}
                            style={{ color: 'white', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '12px' }}
                        >
                            {mode === 'image' ? <Video size={24} /> : <Camera size={24} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Bottom Bar */}
            {previewUrl && (
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 10
                }}>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="btn-primary"
                        style={{
                            padding: '12px 32px',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        <Check size={20} /> Use {mode === 'image' ? 'Photo' : 'Video'}
                    </button>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default CameraCapture;
