"use client";

import { useEffect, useRef } from "react";

export function CanvasGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const GRID = 30;                // grid size
    const RIGHT_BLOCK_RATIO = 0.28; // 28% of screen on the right

    let cols = 0;
    let rows = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      cols = Math.ceil(canvas.width / GRID);
      rows = Math.ceil(canvas.height / GRID);

      draw(); // redraw on resize
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ---------------- GRID LINES ----------------
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

      // ---------------- RIGHT SIDE BLOCK ----------------
      const blockStartCol = Math.floor(cols * (1 - RIGHT_BLOCK_RATIO));

      ctx.fillStyle = "rgba(180,180,180,0.08)";

      for (let x = blockStartCol; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          ctx.fillRect(
            x * GRID,
            y * GRID,
            GRID,
            GRID
          );
        }
      }
    }

    resize();
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
