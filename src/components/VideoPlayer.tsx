import React, { useRef, useState, useEffect } from "react";
import "../styles/VideoPlayer.css";

interface VideoPlayerProps {
    src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const time = parseFloat(e.target.value);
        video.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isMuted) {
            video.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            video.volume = 0;
            setIsMuted(true);
        }
    };

    const changePlaybackRate = () => {
        const video = videoRef.current;
        if (!video) return;

        const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = rates.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % rates.length;
        const newRate = rates[nextIndex];

        video.playbackRate = newRate;
        setPlaybackRate(newRate);
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const downloadVideo = () => {
        const link = document.createElement("a");
        link.href = src;
        link.download = `analisis-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatTime = (time: number): string => {
        if (isNaN(time)) return "0:00";

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className={`video-player-container ${isFullscreen ? "fullscreen" : ""}`}
            ref={containerRef}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(isPlaying ? false : true)}
        >
            <video
                ref={videoRef}
                className="video-element"
                onClick={togglePlay}
            >
                <source src={src} type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
            </video>

            <div className={`video-controls ${showControls ? "visible" : ""}`}>
                <div className="progress-bar-container">
                    <input
                        type="range"
                        className="progress-bar"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                    />
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                <div className="controls-row">
                    <div className="controls-left">
                        <button className="control-button" onClick={togglePlay}>
                            {isPlaying ? "⏸️" : "▶️"}
                        </button>

                        <div className="volume-control">
                            <button className="control-button" onClick={toggleMute}>
                                {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                            </button>
                            <input
                                type="range"
                                className="volume-slider"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                            />
                        </div>

                        <div className="time-display">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="controls-right">
                        <button
                            className="control-button playback-rate"
                            onClick={changePlaybackRate}
                        >
                            {playbackRate}x
                        </button>

                        <button className="control-button" onClick={downloadVideo}>
                            ⬇️
                        </button>

                        <button className="control-button" onClick={toggleFullscreen}>
                            {isFullscreen ? "⛶" : "⛶"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
