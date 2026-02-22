import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export interface PlayerStats {
    id: number;
    team: number;
    total_distance_m: number;
    avg_speed_kmh: number;
    max_speed_kmh: number;
    possession_time_s: number;
}

export interface AnalysisEvent {
    type: "pass" | "interception";
    frame: number;
    time_seconds: number;
    team: number;
}

export interface AnalysisStats {
    summary: {
        total_frames: number;
        duration_seconds: number;
        fps: number;
    };
    teams: {
        team_1: {
            passes: number;
            interceptions: number;
            ball_control_pct: number;
        };
        team_2: {
            passes: number;
            interceptions: number;
            ball_control_pct: number;
        };
    };
    players: PlayerStats[];
    events: AnalysisEvent[];
}

export interface AnalysisResult {
    videoUrl: string;
    stats: AnalysisStats;
}

export const uploadVideo = async (file: File): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/analyze/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return {
        videoUrl: `${API_URL}${response.data.video_url}`,
        stats: response.data.stats,
    };
};
