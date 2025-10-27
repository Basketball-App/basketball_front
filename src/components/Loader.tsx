import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/Loader.css";

interface LoaderProps {
    message?: string;
    /** Optional single MP4 path. Defaults to '/loading.mp4' */
    videoSrc?: string;
    /** Optional list of MP4 paths. If provided, rotates randomly when a video ends */
    videoSrcs?: string[];
}

const DEFAULT_VIDEOS = ["/loading.mp4", "/loading2.mp4", "/loading3.mp4", "/loading4.mp4"];

const Loader: React.FC<LoaderProps> = ({ message = "Procesando...", videoSrc = "/loading.mp4", videoSrcs }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [useVideo, setUseVideo] = useState(true);

    // Prefer local assets under src/assets/loading via Vite glob import
    const discoveredSources = useMemo(() => {
        try {
            const modules = import.meta.glob("../assets/loading/*.{mp4,webm}", { eager: true, import: "default" }) as Record<string, string>;
            return Object.values(modules);
        } catch {
            return [] as string[];
        }
    }, []);

    const allSources = useMemo(() => {
        if (videoSrcs && videoSrcs.length > 0) return videoSrcs;
        if (discoveredSources.length > 0) return discoveredSources;
        return videoSrc ? [videoSrc] : DEFAULT_VIDEOS;
    }, [videoSrcs, discoveredSources, videoSrc]);

    const [sources, setSources] = useState<string[]>(allSources);
    const [currentIndex, setCurrentIndex] = useState<number>(() => Math.floor(Math.random() * Math.max(1, allSources.length)));

    useEffect(() => {
        setSources(allSources);
        setCurrentIndex(Math.floor(Math.random() * Math.max(1, allSources.length)));
    }, [allSources]);

    const pickNextIndex = (list: string[], prevIndex: number): number => {
        if (list.length <= 1) return 0;
        let next = prevIndex;
        while (next === prevIndex) {
            next = Math.floor(Math.random() * list.length);
        }
        return next;
    };
    useEffect(() => {
        if (!useVideo) return;
        const el = videoRef.current;
        if (!el) return;
        // Force reload and attempt autoplay on source change
        el.load();
        const play = () => el.play().catch(() => { });
        el.addEventListener("loadeddata", play, { once: true });
        play();
        return () => el.removeEventListener("loadeddata", play);
    }, [currentIndex, sources, useVideo]);

    return (
        <div className="loader-container">
            {useVideo && sources.length > 0 ? (
                <div className="loading-video-container">
                    <video
                        ref={videoRef}
                        className="loading-video"
                        src={sources[currentIndex]}
                        autoPlay
                        muted
                        loop={false}
                        playsInline
                        preload="auto"
                        onEnded={() => {
                            setCurrentIndex((idx) => pickNextIndex(sources, idx));
                        }}
                        onError={() => {
                            setSources((prev) => {
                                const failing = sources[currentIndex];
                                const filtered = prev.filter((s) => s !== failing);
                                if (filtered.length === 0) {
                                    setUseVideo(false);
                                    return [];
                                }
                                // move to a random remaining source
                                setCurrentIndex(() => Math.floor(Math.random() * filtered.length));
                                return filtered;
                            });
                        }}
                    />
                </div>
            ) : (
                <div className="loading-placeholder" />
            )}
            <p className="loader-message">{message}</p>
            <div className="progress-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
};

export default Loader;

