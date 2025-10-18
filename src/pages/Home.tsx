import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import VideoPlayer from "../components/VideoPlayer";

const Home: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    return (
        <div className="home-container">
            <h1>🏀 Análisis de Jugadas</h1>
            <UploadForm onUploadComplete={setVideoUrl} />
            {videoUrl && (
                <div className="video-section">
                    <h2>Resultado</h2>
                    <VideoPlayer src={videoUrl} />
                </div>
            )}
        </div>
    );
};

export default Home;
