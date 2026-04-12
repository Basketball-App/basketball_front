import React, { useState } from "react";
import type { AnalysisStats } from "../services/video.service";
import "../styles/StatsPanel.css";

interface StatsPanelProps {
    stats: AnalysisStats;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 100);
    if (mins > 0) return `${mins}m ${secs.toString().padStart(2, "0")}s`;
    return `${secs}.${ms.toString().padStart(2, "0")}s`;
}

interface TeamPanelProps {
    stats: AnalysisStats;
    team: 1 | 2;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({ stats, team }) => {
    const teamData = team === 1 ? stats.teams.team_1 : stats.teams.team_2;
    const teamEvents = stats.events.filter((e) => e.team === team);
    const fillClass = team === 1 ? "team-1-fill" : "team-2-fill";

    return (
        <aside className="stats-panel">
            <h3 className="panel-title">Equipo {team}</h3>

            <div className="team-card">
                <div className="stat-row">
                    <span className="stat-label">Control de Balón</span>
                    <span className="stat-value">{teamData.ball_control_pct}%</span>
                </div>
                <div className="control-bar">
                    <div
                        className={`control-fill ${fillClass}`}
                        style={{ width: `${teamData.ball_control_pct}%` }}
                    />
                </div>
                <div className="stat-row">
                    <span className="stat-label">Pases</span>
                    <span className="stat-value">{teamData.passes}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Intercepciones</span>
                    <span className="stat-value">{teamData.interceptions}</span>
                </div>
            </div>

            {teamEvents.length > 0 && (
                <div className="team-events-section">
                    <h4 className="section-subtitle">Eventos</h4>
                    <div className="team-events-list">
                        {teamEvents.map((event, idx) => (
                            <div key={idx} className={`event-item event-${event.type}`}>
                                <span className="event-time">
                                    {formatTime(event.time_seconds)}
                                </span>
                                <span className="event-badge">
                                    {event.type === "pass" ? "Pase" : "Intercepción"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};

export const VideoSummaryPanel: React.FC<StatsPanelProps> = ({ stats }) => {
    const { summary, events, players } = stats;
    const [showHistory, setShowHistory] = useState(false);

    const downloadReport = () => {
        const blob = new Blob([JSON.stringify(stats, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analisis-basketball-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const team1Players = players
        .filter((p) => p.team === 1)
        .sort((a, b) => b.total_distance_m - a.total_distance_m);
    const team2Players = players
        .filter((p) => p.team === 2)
        .sort((a, b) => b.total_distance_m - a.total_distance_m);

    const renderPlayerRow = (player: (typeof players)[0]) => (
        <tr key={player.id}>
            <td className="player-id">#{player.id}</td>
            <td>{player.total_distance_m.toFixed(1)}m</td>
            <td>{player.avg_speed_kmh.toFixed(1)}</td>
            <td>{player.max_speed_kmh.toFixed(1)}</td>
            <td>{player.possession_time_s.toFixed(1)}s</td>
        </tr>
    );

    return (
        <div className="video-summary-panel">
            <div className="summary-row">
                <div className="summary-stat">
                    <span className="summary-stat-value">
                        {formatTime(summary.duration_seconds)}
                    </span>
                    <span className="summary-stat-label">Duración</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-stat">
                    <span className="summary-stat-value">{summary.total_frames}</span>
                    <span className="summary-stat-label">Frames</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-stat">
                    <span className="summary-stat-value">{events.length}</span>
                    <span className="summary-stat-label">Eventos</span>
                </div>
            </div>

            <div className="summary-actions">
                <button className="download-button" onClick={downloadReport}>
                    <span>📄</span> Descargar Reporte
                </button>
                <button
                    className={`history-button ${showHistory ? "active" : ""}`}
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <span>📋</span> Historial
                </button>
            </div>

            {showHistory && (
                <div className="history-section">
                    {team1Players.length > 0 && (
                        <div className="player-table-section">
                            <div className="table-team-header">
                                <span className="team-dot team-1-dot" />
                                <span>Equipo 1</span>
                            </div>
                            <table className="player-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Dist.</th>
                                        <th>Vel. Prom.</th>
                                        <th>Vel. Máx.</th>
                                        <th>Posesión</th>
                                    </tr>
                                </thead>
                                <tbody>{team1Players.map(renderPlayerRow)}</tbody>
                            </table>
                        </div>
                    )}

                    {team2Players.length > 0 && (
                        <div className="player-table-section">
                            <div className="table-team-header">
                                <span className="team-dot team-2-dot" />
                                <span>Equipo 2</span>
                            </div>
                            <table className="player-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Dist.</th>
                                        <th>Vel. Prom.</th>
                                        <th>Vel. Máx.</th>
                                        <th>Posesión</th>
                                    </tr>
                                </thead>
                                <tbody>{team2Players.map(renderPlayerRow)}</tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
