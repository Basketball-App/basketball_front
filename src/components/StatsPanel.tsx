import React, { useState } from "react";
import ExcelJS from "exceljs";
import type {
    AnalysisStats,
    AnalysisEvent,
    PlayerStats,
} from "../services/video.service";
import "../styles/StatsPanel.css";

// Shared palette for the Excel export — matches the app's warm/orange theme.
const EXCEL_THEME = {
    accent: "FFD35400",        // deep orange — section headers
    accentLight: "FFFDEBD0",   // soft orange — section backgrounds
    title: "FF1A1A1A",         // near-black — title band
    titleText: "FFFFFFFF",
    team1: "FFE67E22",         // warm orange
    team2: "FF2980B9",         // cool blue
    teamText: "FFFFFFFF",
    border: "FFBDC3C7",
    labelText: "FF4D4D4D",
};

function makeBorder(color: string = EXCEL_THEME.border) {
    const side = { style: "thin" as const, color: { argb: color } };
    return { top: side, left: side, bottom: side, right: side };
}

function solidFill(argb: string): ExcelJS.FillPattern {
    return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function buildResumenSheet(wb: ExcelJS.Workbook, stats: AnalysisStats) {
    const { summary, teams, players, events } = stats;
    const ws = wb.addWorksheet("Resumen", {
        views: [{ showGridLines: false }],
    });
    ws.columns = [
        { width: 28 },
        { width: 22 },
        { width: 22 },
    ];

    // Title band
    ws.mergeCells("A1:C1");
    const title = ws.getCell("A1");
    title.value = "Reporte de análisis";
    title.font = { name: "Calibri", bold: true, size: 20, color: { argb: EXCEL_THEME.titleText } };
    title.fill = solidFill(EXCEL_THEME.title);
    title.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 34;

    // Subtitle / generated at
    ws.mergeCells("A2:C2");
    const subtitle = ws.getCell("A2");
    subtitle.value = `Generado el ${new Date().toLocaleString()}`;
    subtitle.font = { italic: true, size: 11, color: { argb: EXCEL_THEME.labelText } };
    subtitle.alignment = { vertical: "middle", horizontal: "center" };
    subtitle.fill = solidFill(EXCEL_THEME.accentLight);
    ws.getRow(2).height = 22;

    ws.addRow([]);

    // Section: Resumen general
    sectionHeader(ws, 4, "Resumen general", 3);

    const summaryRows: Array<[string, string | number]> = [
        ["Duración", `${summary.duration_seconds.toFixed(2)} s`],
        ["Frames totales", summary.total_frames],
        ["FPS", summary.fps],
        ["Jugadores detectados", players.length],
        ["Eventos totales", events.length],
    ];
    let r = 5;
    for (const [label, value] of summaryRows) {
        const row = ws.getRow(r);
        row.getCell(1).value = label;
        row.getCell(1).font = { bold: true, color: { argb: EXCEL_THEME.labelText } };
        row.getCell(1).alignment = { vertical: "middle" };
        ws.mergeCells(r, 2, r, 3);
        const valCell = row.getCell(2);
        valCell.value = value;
        valCell.alignment = { vertical: "middle" };
        row.height = 20;
        [1, 2].forEach((c) => {
            row.getCell(c).border = makeBorder();
        });
        ws.getCell(r, 3).border = makeBorder();
        r++;
    }

    r++; // spacer

    // Section: Comparativa de equipos
    sectionHeader(ws, r, "Comparativa de equipos", 3);
    r++;

    // Header row
    const headerRow = ws.getRow(r);
    ["Métrica", "Equipo 1", "Equipo 2"].forEach((h, i) => {
        const c = headerRow.getCell(i + 1);
        c.value = h;
        c.font = { bold: true, color: { argb: EXCEL_THEME.titleText } };
        c.fill = solidFill(EXCEL_THEME.accent);
        c.alignment = { vertical: "middle", horizontal: "center" };
        c.border = makeBorder();
    });
    headerRow.height = 22;
    r++;

    const comparisons: Array<[string, number, number]> = [
        ["Control de balón (%)", teams.team_1.ball_control_pct, teams.team_2.ball_control_pct],
        ["Pases", teams.team_1.passes, teams.team_2.passes],
        ["Intercepciones", teams.team_1.interceptions, teams.team_2.interceptions],
    ];
    for (const [metric, v1, v2] of comparisons) {
        const row = ws.getRow(r);
        row.getCell(1).value = metric;
        row.getCell(1).font = { bold: true };
        row.getCell(2).value = v1;
        row.getCell(3).value = v2;

        // Highlight winner
        if (v1 > v2) row.getCell(2).fill = solidFill(EXCEL_THEME.accentLight);
        else if (v2 > v1) row.getCell(3).fill = solidFill(EXCEL_THEME.accentLight);

        [1, 2, 3].forEach((c) => {
            const cell = row.getCell(c);
            cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "center" };
            cell.border = makeBorder();
        });
        row.height = 20;
        r++;
    }
}

function sectionHeader(ws: ExcelJS.Worksheet, row: number, text: string, span: number) {
    ws.mergeCells(row, 1, row, span);
    const cell = ws.getCell(row, 1);
    cell.value = text;
    cell.font = { bold: true, size: 13, color: { argb: EXCEL_THEME.titleText } };
    cell.fill = solidFill(EXCEL_THEME.accent);
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ws.getRow(row).height = 24;
}

function buildEquiposSheet(
    wb: ExcelJS.Workbook,
    teams: AnalysisStats["teams"],
) {
    const ws = wb.addWorksheet("Equipos", {
        views: [{ showGridLines: false }],
    });
    ws.columns = [{ width: 32 }, { width: 20 }, { width: 20 }];

    // Title
    ws.mergeCells("A1:C1");
    const title = ws.getCell("A1");
    title.value = "Comparativa por equipo";
    title.font = { bold: true, size: 16, color: { argb: EXCEL_THEME.titleText } };
    title.fill = solidFill(EXCEL_THEME.title);
    title.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 30;

    // Team header row with colored team cells
    const headerRow = ws.getRow(2);
    headerRow.getCell(1).value = "Métrica";
    headerRow.getCell(1).font = { bold: true, color: { argb: EXCEL_THEME.titleText } };
    headerRow.getCell(1).fill = solidFill(EXCEL_THEME.accent);

    headerRow.getCell(2).value = "Equipo 1";
    headerRow.getCell(2).font = { bold: true, color: { argb: EXCEL_THEME.teamText } };
    headerRow.getCell(2).fill = solidFill(EXCEL_THEME.team1);

    headerRow.getCell(3).value = "Equipo 2";
    headerRow.getCell(3).font = { bold: true, color: { argb: EXCEL_THEME.teamText } };
    headerRow.getCell(3).fill = solidFill(EXCEL_THEME.team2);

    [1, 2, 3].forEach((c) => {
        headerRow.getCell(c).alignment = { vertical: "middle", horizontal: "center" };
        headerRow.getCell(c).border = makeBorder();
    });
    headerRow.height = 26;

    const rows: Array<[string, number, number]> = [
        ["Control de balón (%)", teams.team_1.ball_control_pct, teams.team_2.ball_control_pct],
        ["Pases", teams.team_1.passes, teams.team_2.passes],
        ["Intercepciones", teams.team_1.interceptions, teams.team_2.interceptions],
    ];

    rows.forEach((data, i) => {
        const row = ws.getRow(3 + i);
        const zebra = i % 2 === 1;
        const bg = zebra ? "FFF8F9FA" : "FFFFFFFF";

        row.getCell(1).value = data[0];
        row.getCell(1).font = { bold: true, color: { argb: EXCEL_THEME.labelText } };
        row.getCell(2).value = data[1];
        row.getCell(3).value = data[2];

        [1, 2, 3].forEach((c) => {
            const cell = row.getCell(c);
            cell.fill = solidFill(bg);
            cell.border = makeBorder();
            cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "center", indent: c === 1 ? 1 : 0 };
        });

        // Highlight winner
        if (data[1] > data[2]) {
            row.getCell(2).font = { bold: true, color: { argb: EXCEL_THEME.team1 } };
        } else if (data[2] > data[1]) {
            row.getCell(3).font = { bold: true, color: { argb: EXCEL_THEME.team2 } };
        }
        row.height = 22;
    });
}

function buildJugadoresSheet(wb: ExcelJS.Workbook, players: PlayerStats[]) {
    const ws = wb.addWorksheet("Jugadores", {
        views: [{ showGridLines: false, state: "frozen", ySplit: 3 }],
    });
    ws.columns = [
        { width: 10 },
        { width: 14 },
        { width: 16 },
        { width: 22 },
        { width: 22 },
        { width: 22 },
    ];

    // Title
    ws.mergeCells("A1:F1");
    const title = ws.getCell("A1");
    title.value = "Estadísticas por jugador";
    title.font = { bold: true, size: 16, color: { argb: EXCEL_THEME.titleText } };
    title.fill = solidFill(EXCEL_THEME.title);
    title.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 30;

    ws.getRow(2).height = 8; // spacer

    const sorted = [...players].sort((a, b) => {
        if (a.team !== b.team) return a.team - b.team;
        return b.total_distance_m - a.total_distance_m;
    });

    const rows = sorted.map((p) => [
        p.id,
        p.team === 0 ? "—" : `Equipo ${p.team}`,
        Number(p.total_distance_m.toFixed(2)),
        Number(p.avg_speed_kmh.toFixed(2)),
        Number(p.max_speed_kmh.toFixed(2)),
        Number(p.possession_time_s.toFixed(2)),
    ]);

    ws.addTable({
        name: "TablaJugadores",
        ref: "A3",
        headerRow: true,
        style: {
            theme: "TableStyleMedium3", // orange theme
            showRowStripes: true,
            showFirstColumn: true,
        },
        columns: [
            { name: "ID" },
            { name: "Equipo" },
            { name: "Distancia (m)" },
            { name: "Velocidad prom. (km/h)" },
            { name: "Velocidad máx. (km/h)" },
            { name: "Tiempo de posesión (s)" },
        ],
        rows,
    });

    // Center-align numeric columns across the table body
    const lastRow = 3 + rows.length;
    for (let r = 4; r <= lastRow; r++) {
        for (let c = 1; c <= 6; c++) {
            const cell = ws.getCell(r, c);
            cell.alignment = { vertical: "middle", horizontal: c === 1 || c === 2 ? "left" : "right", indent: 1 };
        }
        // Team color chip in column 2
        const teamCell = ws.getCell(r, 2);
        const team = sorted[r - 4]?.team;
        if (team === 1) teamCell.font = { bold: true, color: { argb: EXCEL_THEME.team1 } };
        else if (team === 2) teamCell.font = { bold: true, color: { argb: EXCEL_THEME.team2 } };
    }
}

function buildEventosSheet(wb: ExcelJS.Workbook, events: AnalysisEvent[]) {
    const ws = wb.addWorksheet("Eventos", {
        views: [{ showGridLines: false, state: "frozen", ySplit: 3 }],
    });
    ws.columns = [
        { width: 14 },
        { width: 16 },
        { width: 12 },
        { width: 18 },
        { width: 14 },
    ];

    // Title
    ws.mergeCells("A1:E1");
    const title = ws.getCell("A1");
    title.value = "Eventos detectados";
    title.font = { bold: true, size: 16, color: { argb: EXCEL_THEME.titleText } };
    title.fill = solidFill(EXCEL_THEME.title);
    title.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 30;
    ws.getRow(2).height = 8;

    const eventTypeEs = (t: string) => (t === "pass" ? "Pase" : "Intercepción");

    const rows = events.map((e) => [
        Number(e.time_seconds.toFixed(2)),
        formatTime(e.time_seconds),
        e.frame,
        eventTypeEs(e.type),
        e.team === 0 ? "—" : `Equipo ${e.team}`,
    ]);

    ws.addTable({
        name: "TablaEventos",
        ref: "A3",
        headerRow: true,
        style: {
            theme: "TableStyleMedium2", // blue theme
            showRowStripes: true,
        },
        columns: [
            { name: "Tiempo (s)" },
            { name: "Tiempo (mm:ss)" },
            { name: "Frame" },
            { name: "Tipo" },
            { name: "Equipo" },
        ],
        rows,
    });

    const lastRow = 3 + rows.length;
    for (let r = 4; r <= lastRow; r++) {
        for (let c = 1; c <= 5; c++) {
            const cell = ws.getCell(r, c);
            cell.alignment = { vertical: "middle", horizontal: "center" };
        }
        const ev = events[r - 4];
        if (!ev) continue;

        // Color the "Tipo" cell by event type
        const tipoCell = ws.getCell(r, 4);
        tipoCell.font = {
            bold: true,
            color: { argb: ev.type === "pass" ? "FF27AE60" : "FFC0392B" },
        };

        // Color the "Equipo" cell by team
        if (ev.team === 1 || ev.team === 2) {
            const teamCell = ws.getCell(r, 5);
            teamCell.font = {
                bold: true,
                color: { argb: ev.team === 1 ? EXCEL_THEME.team1 : EXCEL_THEME.team2 },
            };
        }
    }
}

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

    const downloadReport = async () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Basketball Analytics";
        workbook.created = new Date();

        buildResumenSheet(workbook, stats);
        buildEquiposSheet(workbook, stats.teams);
        buildJugadoresSheet(workbook, stats.players);
        buildEventosSheet(workbook, stats.events);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analisis-basketball-${Date.now()}.xlsx`;
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
