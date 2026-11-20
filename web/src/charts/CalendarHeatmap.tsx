import React, { useState } from "react";
import { computePM25AQI, CPCB_BREAKPOINTS } from "../lib/aqi";
import { formatDate } from "../lib/format";

interface CalendarHeatmapProps {
  dailyData: any[];
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ dailyData }) => {
  // Extract available years
  const years = Array.from(new Set(dailyData.map((d) => d.date.slice(0, 4)))).sort();
  const [selectedYear, setSelectedYear] = useState<string>(years[years.length - 1] || "2024");
  const [hoveredDay, setHoveredDay] = useState<any | null>(null);

  const filteredDays = dailyData.filter((d) => d.date.startsWith(selectedYear));
  const dayMap = new Map<string, any>();
  filteredDays.forEach((d) => dayMap.set(d.date, d));

  // Build grid calendar starting from Jan 1 of selectedYear to Dec 31
  const startDate = new Date(`${selectedYear}-01-01`);
  const endDate = new Date(`${selectedYear}-12-31`);

  // Align to Monday start
  const startDayOfWeek = (startDate.getDay() + 6) % 7; // 0: Mon, ..., 6: Sun
  const weeks: { dateStr: string; dayData: any | null }[][] = [];

  let currentWeek: { dateStr: string; dayData: any | null }[] = [];
  // Fill initial blanks
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push({ dateStr: "", dayData: null });
  }

  const cur = new Date(startDate);
  while (cur <= endDate) {
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, "0");
    const dd = String(cur.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    currentWeek.push({ dateStr, dayData: dayMap.get(dateStr) || null });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cur.setDate(cur.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ dateStr: "", dayData: null });
    }
    weeks.push(currentWeek);
  }

  // Month label positions
  const monthLabels: { label: string; weekIdx: number }[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let lastSeenMonth = -1;
  weeks.forEach((week, wIdx) => {
    const validDay = week.find((d) => d.dateStr !== "");
    if (validDay) {
      const m = parseInt(validDay.dateStr.slice(5, 7), 10) - 1;
      if (m !== lastSeenMonth) {
        monthLabels.push({ label: monthNames[m], weekIdx: wIdx });
        lastSeenMonth = m;
      }
    }
  });

  return (
    <div>
      {/* Year Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", backgroundColor: "var(--bg-tertiary)", padding: "4px", borderRadius: "var(--radius-pill)" }}>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              style={{
                background: selectedYear === y ? "var(--bg-secondary)" : "transparent",
                color: selectedYear === y ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.8125rem",
                fontWeight: selectedYear === y ? 700 : 500,
                boxShadow: selectedYear === y ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
                transition: "all var(--t-hover)"
              }}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Hover info banner */}
        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", height: "24px", display: "flex", alignItems: "center" }}>
          {hoveredDay ? (
            <span>
              <strong>{formatDate(hoveredDay.date)}</strong>: {hoveredDay.pm25} µg/m³ (AQI: {hoveredDay.aqi}) — <span style={{ fontWeight: 700 }}>{hoveredDay.category}</span>
            </span>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>Hover over any day to inspect details</span>
          )}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <div style={{ display: "inline-block", minWidth: "750px" }}>
          {/* Month labels */}
          <div style={{ display: "flex", marginLeft: "28px", height: "18px", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
            {monthLabels.map((ml, idx) => (
              <div key={idx} style={{ position: "relative", left: `${ml.weekIdx * 15}px`, marginRight: "20px" }}>
                {ml.label}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "3px" }}>
            {/* Weekday labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", width: "25px", fontSize: "0.625rem", color: "var(--text-muted)", justifyContent: "space-between" }}>
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Weeks columns */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {week.map((cell, dIdx) => {
                  if (!cell.dateStr) {
                    return <div key={dIdx} style={{ width: "12px", height: "12px", opacity: 0 }} />;
                  }

                  const d = cell.dayData;
                  const bg = d ? `var(${computePM25AQI(d.pm25).colorToken})` : "var(--bg-tertiary)";

                  return (
                    <div
                      key={cell.dateStr}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "2.5px",
                        backgroundColor: bg,
                        cursor: d ? "pointer" : "default",
                        transition: "transform 0.1s ease",
                        transform: hoveredDay?.date === cell.dateStr ? "scale(1.3)" : "none",
                        zIndex: hoveredDay?.date === cell.dateStr ? 10 : 1
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        marginTop: "1.25rem",
        fontSize: "0.75rem",
        color: "var(--text-muted)"
      }}>
        <span>Indian CPCB PM₂.₅ AQI Scale:</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {CPCB_BREAKPOINTS.map((b) => (
            <div key={b.category} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: `var(${b.colorToken})` }} />
              <span>{b.category} ({b.bpLo}–{b.bpHi})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
