"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, Circle } from "lucide-react";
import type { OutputBatchItem } from "@/app/api/outputs/route";

interface OutputsCalendarViewProps {
  items: OutputBatchItem[];
  onSelectBatch: (item: OutputBatchItem) => void;
}

export function OutputsCalendarView({ items, onSelectBatch }: OutputsCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group items by date string YYYY-MM-DD
  const itemsByDate: Record<string, OutputBatchItem[]> = {};

  for (const item of items) {
    let dateKey = "";
    if (item.status === "scheduled" && item.scheduledDate) {
      dateKey = item.scheduledDate.split("T")[0];
    } else {
      dateKey = new Date(item.createdAt).toISOString().split("T")[0];
    }

    if (!itemsByDate[dateKey]) itemsByDate[dateKey] = [];
    itemsByDate[dateKey].push(item);
  }

  // Generate calendar grid cells
  const calendarCells = [];
  // Padding cells before day 1
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ isPadding: true, dayNumber: 0, dateKey: "" });
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateKey = `${year}-${pad(month + 1)}-${pad(d)}`;
    calendarCells.push({ isPadding: false, dayNumber: d, dateKey });
  }

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-4 w-full bg-card border border-border/70 rounded-xl p-4 shadow-sm">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground font-heading">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="xs" onClick={handleToday} className="h-7 px-2.5 text-xs font-semibold">
            Today
          </Button>
          <Button variant="outline" size="icon-xs" onClick={handlePrevMonth} className="size-7" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon-xs" onClick={handleNextMonth} className="size-7" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground uppercase border-b border-border/60 pb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 min-h-0 md:min-h-[480px]">
        {calendarCells.map((cell, idx) => {
          if (cell.isPadding) {
            return <div key={`pad-${idx}`} className="bg-muted/10 rounded-lg border border-transparent aspect-square md:aspect-auto md:min-h-[90px]" />;
          }

          const dayItems = itemsByDate[cell.dateKey] || [];
          const isToday = cell.dateKey === todayKey;

          return (
            <div
              key={cell.dateKey}
              className={`flex flex-col gap-1 p-1 sm:p-2 rounded-lg border aspect-square md:aspect-auto md:min-h-[95px] transition-all overflow-hidden ${
                isToday
                  ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/50 bg-card/60 hover:border-border/80 hover:bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold font-mono size-5 flex items-center justify-center rounded-full ${
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground/80"
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {dayItems.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0 bg-muted text-muted-foreground">
                    {dayItems.length}
                  </Badge>
                )}
              </div>

              {/* Day Output Items */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px]">
                {dayItems.map((item) => (
                  <button
                    key={item.folderName}
                    onClick={() => onSelectBatch(item)}
                    className={`text-left text-[10px] p-1.5 rounded border flex items-center gap-1.5 transition-all cursor-pointer truncate ${
                      item.status === "posted"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                        : item.status === "scheduled"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                        : "bg-muted/80 border-border/60 text-foreground/90 hover:bg-muted"
                    }`}
                    title={item.title}
                  >
                    {item.status === "posted" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : item.status === "scheduled" ? (
                      <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 opacity-60 shrink-0" />
                    )}
                    <span className="truncate font-semibold">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
