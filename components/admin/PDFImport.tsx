"use client";

import { useState, useRef } from "react";
import ImportReview from "./ImportReview";
import type { ExtractedDish } from "@/types";

type Stage = "upload" | "extracting" | "review";

export default function PDFImport() {
  const [stage, setStage] = useState<Stage>("upload");
  const [dishes, setDishes] = useState<ExtractedDish[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [mode, setMode] = useState<"file" | "paste">("file");
  const inputRef = useRef<HTMLInputElement>(null);

  const processText = async (text: string, name: string) => {
    if (text.trim().length < 50) {
      setError("Text is too short to be a valid menu.");
      return;
    }

    setError("");
    setFileName(name);
    setStage("extracting");
    setProgress("Sending to AI...");

    try {
      const res = await fetch("/api/menu/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Extraction failed. Please try again.");
        setStage("upload");
        return;
      }

      setProgress(`Done — ${data.dishes.length} dishes found across ${data.chunks} chunks`);
      setDishes(data.dishes);
      setStage("review");
    } catch {
      setError("Network error. Please try again.");
      setStage("upload");
    }
  };

  const handleFile = async (file: File) => {
    const validTypes = ["text/plain", "text/csv"];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      setError("Please upload a .txt file. Extract text from your PDF first using: pdftotext menu.pdf menu.txt");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      return;
    }
    const text = await file.text();
    await processText(text, file.name);
  };

  const handlePaste = async () => {
    if (!pastedText.trim()) {
      setError("Please paste your menu text first.");
      return;
    }
    await processText(pastedText, "pasted text");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleReset = () => {
    setStage("upload");
    setDishes([]);
    setFileName("");
    setError("");
    setProgress("");
    setPastedText("");
  };

  if (stage === "review") {
    return <ImportReview dishes={dishes} onReset={handleReset} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(["file", "paste"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === m
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "file" ? "📄 Upload .txt file" : "📋 Paste text"}
          </button>
        ))}
      </div>

      {/* Extracting state */}
      {stage === "extracting" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <p className="font-bold text-gray-800">Extracting menu...</p>
          <p className="text-sm text-gray-500 mt-1">
            Processing <span className="font-medium text-green-600">{fileName}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{progress}</p>
          <p className="text-xs text-gray-400 mt-3">
            Large menus may take 1–2 minutes — processed in chunks
          </p>
          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto mt-4">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}

      {/* File upload */}
      {stage === "upload" && mode === "file" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-white hover:border-green-400 hover:bg-green-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <p className="font-bold text-gray-800">Drop your menu .txt file here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-left w-full max-w-xs">
              <p className="text-xs font-bold text-gray-600 mb-1">Extract text from PDF first:</p>
              <code className="text-xs text-green-700 font-mono">pdftotext menu.pdf menu.txt</code>
            </div>
            <p className="text-xs text-gray-400">.txt only · Max 5MB</p>
          </div>
        </div>
      )}

      {/* Paste text */}
      {stage === "upload" && mode === "paste" && (
        <div className="flex flex-col gap-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your menu text here...&#10;&#10;Example:&#10;1. Tort Krant Informații nutriționale 100g Valoare Energetică (kJ/kcal): 917 / 218..."
            rows={12}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-300 transition-all resize-none font-mono"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {pastedText.length > 0 ? `${pastedText.length.toLocaleString()} characters` : "Paste your full menu text above"}
            </span>
            <button
              onClick={handlePaste}
              disabled={!pastedText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm shadow active:scale-95 transition-all disabled:opacity-40"
            >
              Extract Menu →
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Tips */}
      {stage === "upload" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">How it works</p>
          <ol className="flex flex-col gap-2">
            {[
              "Run: pdftotext menu.pdf menu.txt (install with: sudo apt install poppler-utils)",
              "Upload the .txt file or paste its contents above",
              "AI extracts all dishes, prices, macros and allergens automatically",
              "Review and edit any dish before confirming the import",
              "Confirming replaces your entire current menu",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-500">
                <span className="text-green-500 font-bold flex-shrink-0">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
