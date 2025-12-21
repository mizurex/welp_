"use client";

import { useEffect, useRef } from "react";

interface Tile {
  x: number;
  y: number;
  opacity: number;
  target: number;
}

export function CanvasGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<Tile[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    
    const GRID = 30;                 // 👈 grid size (smaller = denser)
    const SAFE_ZONE_RATIO = 0.25;    // 👈 25% left & right kept clean
    const MAX_TILES = 4;

    let cols = 0;
    let rows = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / GRID);
      rows = Math.ceil(canvas.height / GRID);
    }

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- GRID LINES ---
      ctx.strokeStyle = "rgba(180,180,180,0.15)";
      ctx.lineWidth = 1;

      for (let x = 0; x <= canvas.width; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // --- BLINKING TILE COLOR ---
      const glow = "80,160,255"; // blue (change this freely)

      tilesRef.current.forEach((t) => {
        ctx.shadowBlur = 35 * t.opacity;
        ctx.shadowColor = `rgba(${glow}, ${0.5 * t.opacity})`;

        ctx.fillStyle = `rgba(${glow}, ${0.1 * t.opacity})`;
        ctx.fillRect(t.x * GRID, t.y * GRID, GRID, GRID);
      });

      ctx.shadowBlur = 0;
    }

    function animate() {
      drawGrid();

      // Smooth fade
      tilesRef.current.forEach((t) => {
        t.opacity += (t.target - t.opacity) * 0.08;
      });

      tilesRef.current = tilesRef.current.filter(
        (t) => t.opacity > 0.01
      );

      // --- SPAWN NEW TILE (CENTER ONLY) ---
      if (Math.random() < 0.02 && tilesRef.current.length < MAX_TILES) {
        const safeStart = Math.floor(cols * SAFE_ZONE_RATIO);
        const safeEnd = Math.floor(cols * (1 - SAFE_ZONE_RATIO));

        const x = Math.floor(
          safeStart + Math.random() * (safeEnd - safeStart)
        );

        const y = Math.floor(Math.random() * rows);

        const tile: Tile = { x, y, opacity: 0, target: 1 };
        tilesRef.current.push(tile);

        setTimeout(() => {
          tile.target = 0;
        }, 1500);
      }

      requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
