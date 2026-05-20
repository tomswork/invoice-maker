"use client";

import SignaturePad from "signature_pad";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type SignaturePadFieldProps = {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
};

function resizeCanvas(canvas: HTMLCanvasElement) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.getContext("2d")?.scale(ratio, ratio);
  return { width, height, ratio };
}

export function SignaturePadField({ value, onChange }: SignaturePadFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const onChangeRef = useRef(onChange);
  const lastValueRef = useRef<string | undefined>(value);

  onChangeRef.current = onChange;

  const syncFromValue = useCallback((dataUrl: string | undefined) => {
    const pad = padRef.current;
    const canvas = canvasRef.current;
    if (!pad || !canvas) return;

    if (!dataUrl) {
      pad.clear();
      return;
    }

    const { width, height, ratio } = resizeCanvas(canvas);
    pad.fromDataURL(dataUrl, { ratio, width, height });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas(canvas);

    const pad = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(15, 23, 42)",
      minWidth: 0.6,
      maxWidth: 2.8,
      velocityFilterWeight: 0.65,
      throttle: 10,
    });
    padRef.current = pad;

    const onEnd = () => {
      if (pad.isEmpty()) {
        lastValueRef.current = undefined;
        onChangeRef.current(undefined);
        return;
      }
      const dataUrl = pad.toDataURL("image/png");
      lastValueRef.current = dataUrl;
      onChangeRef.current(dataUrl);
    };

    pad.addEventListener("endStroke", onEnd);

    const onResize = () => {
      const snapshot = pad.isEmpty()
        ? lastValueRef.current
        : pad.toDataURL("image/png");
      const { width, height, ratio } = resizeCanvas(canvas);
      pad.clear();
      if (snapshot) {
        pad.fromDataURL(snapshot, { ratio, width, height });
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      pad.removeEventListener("endStroke", onEnd);
      pad.off();
      padRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (value === lastValueRef.current) return;
    lastValueRef.current = value;
    syncFromValue(value);
  }, [value, syncFromValue]);

  function clear() {
    padRef.current?.clear();
    lastValueRef.current = undefined;
    onChangeRef.current(undefined);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-zinc-600 bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          className="block h-36 w-full touch-none cursor-crosshair"
          aria-label="Draw your signature"
        />
      </div>
      <p className="text-xs text-zinc-500">
        Draw with mouse or finger. Stroke weight varies like ink on paper.
      </p>
      <Button type="button" variant="secondary" onClick={clear}>
        Clear signature
      </Button>
    </div>
  );
}
