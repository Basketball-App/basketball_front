import React from "react";

interface VideoPlayerProps {
    src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    return (
        <video controls width="640" height="360">
            <source src={src} type="video/mp4" />
            Tu navegador no soporta la reproducción de video.
        </video>
    );
};

export default VideoPlayer;
