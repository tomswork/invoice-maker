"use client";

import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { formatAuLineDate, fromDateInputValue } from "@/lib/line-items";
import { Label } from "@/components/ui/input";
import "react-day-picker/style.css";
import "./au-date-picker.css";

type AuDatePickerProps = {
  id?: string;
  label?: string;
  value: number;
  onChange: (timestamp: number) => void;
};

function CalendarChevron({
  orientation,
  className,
}: {
  orientation?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const iconClass = `h-4 w-4 text-zinc-400 ${className ?? ""}`;
  if (orientation === "left") {
    return <ChevronLeft className={iconClass} strokeWidth={2} />;
  }
  if (orientation === "right") {
    return <ChevronRight className={iconClass} strokeWidth={2} />;
  }
  return <ChevronRight className={iconClass} strokeWidth={2} />;
}

export function AuDatePicker({ id, label = "Date", value, onChange }: AuDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedDate = new Date(value);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(fromDateInputValue(format(date, "yyyy-MM-dd")));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor={id}>{label}</Label>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={`mt-0 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500/40 ${
          open
            ? "border-zinc-500 bg-zinc-900 ring-2 ring-zinc-500/40"
            : "border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900"
        }`}
      >
        <Calendar className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="font-medium tabular-nums">{formatAuLineDate(value)}</span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
          className="au-calendar absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900 p-3 shadow-2xl shadow-black/50"
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate}
            weekStartsOn={1}
            components={{ Chevron: CalendarChevron }}
          />
        </div>
      )}
    </div>
  );
}
