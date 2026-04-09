"use client";

import { useState, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";
import WorldViewer from "@/components/WorldViewer";

type AppState =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "processing"; imageUrl: string; imageDataUrl: string }
  | { phase: "ready"; imageDataUrl: string; depthDataUrl: string }
  | { phase: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<AppState>({ phase: "idle" });

  const handleImageSelected = useCallback(
    async (file: File) => {
      setState({ phase: "uploading" });

      const imageDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target!.result as string);
        reader.readAsDataURL(file);
      });

      setState({
        phase: "processing",
        imageUrl: imageDataUrl,
        imageDataUrl,
      });

      try {
        const res = await fetch("/api/depth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error ?? "Depth estimation failed");
        }

        const { depthDataUrl } = await res.json();
        setState({ phase: "ready", imageDataUrl, depthDataUrl });
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050508]">
      {(state.phase === "ready") && (
        <div className="absolute inset-0">
          <WorldViewer
            imageDataUrl={state.imageDataUrl}
            depthDataUrl={state.depthDataUrl}
          />
        </div>
      )}

      {(state.phase === "idle" || state.phase === "error") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4">
          <div className="text-center space-y-3 max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              WorldView
            </h1>
            <p className="text-lg text-white/60">
              Drop any photo. AI reads the depth. You explore the world.
            </p>
          </div>

          <ImageUpload onImageSelected={handleImageSelected} />

          {state.phase === "error" && (
            <p className="text-red-400 text-sm max-w-sm text-center">
              {state.message}
            </p>
          )}

          <p className="text-white/30 text-xs text-center max-w-xs">
            Powered by Depth-Anything AI + Three.js WebGL
          </p>
        </div>
      )}

      {(state.phase === "uploading" || state.phase === "processing") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          {state.phase === "processing" && (
            <div
              className="w-48 h-32 rounded-lg bg-cover bg-center opacity-40 blur-sm"
              style={{ backgroundImage: `url(${state.imageDataUrl})` }}
            />
          )}
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60 text-sm">
              {state.phase === "uploading"
                ? "Loading image…"
                : "Estimating depth with AI…"}
            </p>
            {state.phase === "processing" && (
              <p className="text-white/30 text-xs">
                First run may take ~15s on free tier
              </p>
            )}
          </div>
        </div>
      )}

      {state.phase === "ready" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-colors backdrop-blur-sm border border-white/10"
          >
            New image
          </button>
        </div>
      )}
    </main>
  );
}
