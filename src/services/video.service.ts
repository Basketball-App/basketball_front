import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // Ajusta al puerto de tu backend

export const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/analyze/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // recibimos video procesado
    });

    // Convertimos el blob en una URL de video para el frontend
    return URL.createObjectURL(response.data);
};
