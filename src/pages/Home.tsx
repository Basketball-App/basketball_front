import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import VideoPlayer from "../components/VideoPlayer";
import "../styles/Home.css";

const Home: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    return (
        <div className="home-container">
            <header className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon">🏀</div>
                    <h1 className="hero-title">Análisis de Jugadas</h1>
                    <p className="hero-subtitle">
                        Analiza videos de basketball con inteligencia artificial
                    </p>
                </div>
            </header>

            <main className="main-content">
                {!videoUrl ? (
                    <section className="upload-section">
                        <div className="section-header">
                            <h2>Comienza tu Análisis</h2>
                            <p>Sube un video de basketball y obtén análisis detallado en tiempo real</p>
                        </div>
                        <UploadForm onUploadComplete={setVideoUrl} />

                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">👥</div>
                                <h3>Tracking de Jugadores</h3>
                                <p>Seguimiento automático de todos los jugadores en la cancha</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🏀</div>
                                <h3>Detección de Balón</h3>
                                <p>Rastreo preciso del balón durante todo el partido</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📊</div>
                                <h3>Estadísticas</h3>
                                <p>Métricas detalladas de velocidad, distancia y posesión</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🗺️</div>
                                <h3>Vista Táctica</h3>
                                <p>Visualización estratégica desde arriba de la cancha</p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="results-section">
                        <div className="section-header">
                            <h2>Video Analizado</h2>
                            <p>Tu análisis está listo. Revisa los resultados a continuación</p>
                            <button
                                className="new-analysis-button"
                                onClick={() => setVideoUrl(null)}
                            >
                                <span>➕</span> Nuevo Análisis
                            </button>
                        </div>
                        <div className="video-wrapper">
                            <VideoPlayer src={videoUrl} />
                        </div>
                    </section>
                )}
            </main>

            <footer className="footer">
                <p>Powered by Computer Vision & Machine Learning</p>
            </footer>
        </div>
    );
};

export default Home;
