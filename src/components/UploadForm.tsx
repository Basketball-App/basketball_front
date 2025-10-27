import React, { useState, useRef } from "react";
import { uploadVideo } from "../services/video.service";
import Loader from "./Loader";
import "../styles/UploadForm.css";

interface UploadFormProps {
    onUploadComplete: (videoUrl: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const validateFile = (file: File): boolean => {
        const validTypes = ["video/mp4"];
        const maxSize = 500 * 1024 * 1024; // 500MB

        if (!validTypes.includes(file.type)) {
            setError("Por favor selecciona un archivo de video MP4 válido");
            return false;
        }

        if (file.size > maxSize) {
            setError("El archivo es demasiado grande. Máximo 500MB");
            return false;
        }

        setError(null);
        return true;
    };

    const handleFile = (selectedFile: File) => {
        if (validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        try {
            const videoUrl = await uploadVideo(file);
            onUploadComplete(videoUrl);
        } catch (error) {
            console.error("❌ Error al subir el video:", error);
            setError("Error al procesar el video. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    if (loading) {
        return <Loader message="Analizando tu video... Esto puede tomar unos minutos" />;
    }

    return (
        <div className="upload-form-container">
            <form onSubmit={handleSubmit} className="upload-form">
                <div
                    className={`dropzone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleButtonClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleChange}
                        className="file-input"
                    />

                    {!file ? (
                        <>
                            <div className="upload-icon">🏀</div>
                            <h3>Arrastra tu video aquí</h3>
                            <p>o haz clic para seleccionar</p>
                            <span className="file-types">Formato MP4 (Máx. 500MB)</span>
                        </>
                    ) : (
                        <div className="file-info">
                            <div className="file-icon">🎬</div>
                            <div className="file-details">
                                <h4>{file.name}</h4>
                                <p>{formatFileSize(file.size)}</p>
                            </div>
                            <button
                                type="button"
                                className="remove-file"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setError(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || loading}
                    className="submit-button"
                >
                    <span className="button-icon">🔍</span>
                    Subir y Analizar
                </button>
            </form>
        </div>
    );
};

export default UploadForm;
