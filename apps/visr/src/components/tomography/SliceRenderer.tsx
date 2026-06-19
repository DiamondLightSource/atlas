import { useRef, useEffect } from "react";
import Box from "@mui/material/Box";

interface SliceRendererProps {
  slicearray: number[][];
}

export default function SliceRenderer({ slicearray }: SliceRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rows = slicearray.length;
    const cols = slicearray[0].length;
    canvas.width = cols;
    canvas.height = rows;

    slicearray.forEach((row, r) => {
      row.forEach((value, c) => {
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(c, r, 1, 1);
      });
    });
  }, [slicearray]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      sx={{
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
      }}
    />
  );
}
