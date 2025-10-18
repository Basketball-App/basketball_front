import React, { useState } from "react";
import { uploadVideo } from "../services/video.service";

interface UploadFormProps {
    onUploadComplete: (videoUrl: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            const videoUrl = await uploadVideo(file);
            onUploadComplete(videoUrl);
        } catch (error) {
            console.error("❌ Error al subir el video:", error);
            alert("Error al procesar el video");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="upload-form">
            <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Procesando..." : "Subir y Analizar"}
            </button>
        </form>
    );
};

export default UploadForm;
