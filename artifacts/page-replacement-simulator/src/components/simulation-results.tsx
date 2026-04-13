import { useRef, useState, useEffect } from "react";
import type { AlgorithmResult, SimulationResponse } from "@workspace/api-client-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SimulationResultsProps {
  data: SimulationResponse;
  runId: number;
}

const ALGO_COLORS = {
  FIFO:    { bar: "hsl(243 75% 59%)", bg: "hsl(243 75% 59% / 0.08)", border: "hsl(243 75% 59% / 0.25)", text: "hsl(243 75% 45%)" },
  LRU:     { bar: "hsl(173 58% 39%)", bg: "hsl(173 58% 39% / 0.08)", border: "hsl(173 58% 39% / 0.25)", text: "hsl(173 58% 30%)" },
  Optimal: { bar: "hsl(35 91% 55%)",  bg: "hsl(35 91% 55% / 0.08)",  border: "hsl(35 91% 55% / 0.25)",  text: "hsl(35 91% 35%)"  },
};
// Raw color values for Chart.js (CSS variables don't work inside canvas context)
const BAR_COLORS = {
  FIFO:    { faults: "rgba(99,  82, 220, 0.85)", hits: "rgba(99,  82, 220, 0.30)" },
  LRU:     { faults: "rgba(31, 143, 121, 0.85)", hits: "rgba(31, 143, 121, 0.30)" },
  Optimal: { faults: "rgba(234,147,  30, 0.85)", hits: "rgba(234,147,  30, 0.30)" },
};
const FALLBACK_BAR = { faults: "rgba(99,82,220,0.85)", hits: "rgba(99,82,220,0.30)" };

function FaultComparisonChart({ results }: { results: SimulationResponse["results"] }) {
  const chartRef = useRef<ChartJS<"bar">>(null);

  const labels = results.map((r) => r.algorithm);

  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Page Faults",
        data: results.map((r) => r.pageFaults),
        backgroundColor: results.map((r) => (BAR_COLORS[r.algorithm as keyof typeof BAR_COLORS] ?? FALLBACK_BAR).faults),
        borderColor:      results.map((r) => (BAR_COLORS[r.algorithm as keyof typeof BAR_COLORS] ?? FALLBACK_BAR).faults.replace("0.85", "1")),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 56,
      },
      {
        label: "Page Hits",
        data: results.map((r) => r.pageHits),
        backgroundColor: results.map((r) => (BAR_COLORS[r.algorithm as keyof typeof BAR_COLORS] ?? FALLBACK_BAR).hits),
        borderColor:      results.map((r) => (BAR_COLORS[r.algorithm as keyof typeof BAR_COLORS] ?? FALLBACK_BAR).hits.replace("0.30", "0.6")),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 56,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: "easeInOutQuart" },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: "Inter, sans-serif", size: 12 },
          usePointStyle: true,
          pointStyle: "rectRounded",
          pointStyleWidth: 10,
          padding: 20,
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        boxPadding: 4,
        callbacks: {
          title: (items) => `${items[0].label} Algorithm`,
          label: (ctx) => `  ${ctx.dataset.label}: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { family: "Inter, sans-serif", size: 12, weight: 600 },
          color: "#475569",
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          font: { family: "Inter, sans-serif", size: 11 },
          color: "#94a3b8",
          stepSize: 1,
        },
      },
    },
  };

  // Use a key so Chart.js remounts (with fresh animation) when the algorithm set changes
  const chartKey = labels.join("-");

  return (
    <div className="h-[280px]" data-testid="chart-performance">
      <Bar key={chartKey} ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

export function SimulationResults({ data, runId }: SimulationResultsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

      {/* Chart.js Performance Chart */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Performance Comparison</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Page faults and hits per algorithm</p>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "rgba(99,82,220,0.85)" }} />
              Faults
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "rgba(99,82,220,0.30)" }} />
              Hits
            </span>
          </div>
        </div>
        <div className="p-5">
          <FaultComparisonChart results={data.results} />
        </div>
      </div>

      {/* Summary stat row */}
      {data.results.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.results.map((r, idx) => {
            const colors = ALGO_COLORS[r.algorithm as keyof typeof ALGO_COLORS];
            const bg = colors?.bg ?? "hsl(var(--muted) / 0.5)";
            const border = colors?.border ?? "hsl(var(--border))";
            const textColor = colors?.text ?? "hsl(var(--foreground))";
            return (
              <div
                key={r.algorithm}
                className="rounded-xl border p-4 flex flex-col gap-2"
                style={{ background: bg, borderColor: border }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: textColor }}>{r.algorithm}</span>
                  <span className="text-xs text-muted-foreground font-medium">{(r.hitRatio * 100).toFixed(1)}% hit rate</span>
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wide mb-0.5">Faults</p>
                    <p className="font-mono text-2xl font-bold leading-none text-destructive" data-testid={`text-faults-${r.algorithm}`}>
                      {r.pageFaults}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wide mb-0.5">Hits</p>
                    <p className="font-mono text-2xl font-bold leading-none text-emerald-600" data-testid={`text-hits-${r.algorithm}`}>
                      {r.pageHits}
                    </p>
                  </div>
                </div>
                {/* Mini progress bar — hit ratio */}
                <div className="h-1.5 rounded-full bg-border overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${r.hitRatio * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Per-algorithm step tables */}
      <div className="space-y-5">
        {data.results.map((result) => (
          <AlgorithmTable key={result.algorithm} result={result} totalFrames={data.frames} />
        ))}
      </div>
    </div>
  );
}

function FrameCell({
  value,
  isNewlyLoaded,
  isHitTarget,
  accentText,
  accentBorder,
}: {
  value: number | null;
  isNewlyLoaded: boolean;
  isHitTarget: boolean;
  accentText: string;
  accentBorder: string;
}) {
  if (value === null) {
    return (
      <div className="w-9 h-9 mx-auto rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
        <span className="text-muted-foreground/30 text-xs select-none">·</span>
      </div>
    );
  }
  if (isNewlyLoaded) {
    return (
      <div
        className="w-9 h-9 mx-auto rounded-lg border-2 flex items-center justify-center relative"
        style={{ borderColor: accentBorder, backgroundColor: accentBorder }}
      >
        <span className="font-mono font-bold text-sm" style={{ color: accentText }}>
          {value}
        </span>
        {/* "new" dot */}
        <span
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-background"
          style={{ backgroundColor: accentText }}
        />
      </div>
    );
  }
  if (isHitTarget) {
    return (
      <div className="w-9 h-9 mx-auto rounded-lg border-2 border-emerald-300 bg-emerald-50 flex items-center justify-center relative">
        <span className="font-mono font-bold text-sm text-emerald-700">{value}</span>
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-background" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 mx-auto rounded-lg border border-border bg-muted/40 flex items-center justify-center">
      <span className="font-mono font-medium text-sm text-foreground">{value}</span>
    </div>
  );
}

function AlgorithmTable({ result, totalFrames }: { result: AlgorithmResult; totalFrames: number }) {
  const frameIndices = Array.from({ length: totalFrames }, (_, i) => i);
  const colors = ALGO_COLORS[result.algorithm as keyof typeof ALGO_COLORS];
  const accentBg     = colors?.bg     ?? "hsl(var(--muted) / 0.5)";
  const accentBorder = colors?.border ?? "hsl(var(--border))";
  const accentText   = colors?.text   ?? "hsl(var(--primary))";

  const faultCount = result.pageFaults;
  const hitCount   = result.pageHits;
  const total      = faultCount + hitCount;

  return (
    <div
      className="bg-card rounded-xl shadow-sm overflow-hidden border"
      style={{ borderColor: accentBorder }}
      data-testid={`results-${result.algorithm}`}
    >
      {/* Card header */}
      <div className="px-5 py-3.5 border-b" style={{ background: accentBg, borderColor: accentBorder }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-base" style={{ color: accentText }}>
              {result.algorithm} Algorithm
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">Step-by-step memory frame states</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-2.5 py-1 rounded-lg text-xs font-semibold border border-destructive/20">
              <span className="font-mono text-sm font-bold">{faultCount}</span>
              <span>faults</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-200">
              <span className="font-mono text-sm font-bold">{hitCount}</span>
              <span>hits</span>
            </div>
            <div
              className="flex items-center gap-1.5 bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-lg text-xs font-semibold border border-border"
              data-testid={`text-ratio-${result.algorithm}`}
            >
              <span className="font-mono text-sm font-bold text-foreground">
                {(result.hitRatio * 100).toFixed(1)}%
              </span>
              <span>hit rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable step table */}
      <div className="overflow-x-auto results-scroll">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {/* Step # */}
              <th className="w-10 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-r border-border">
                #
              </th>
              {/* Reference page */}
              <th className="w-14 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-r border-border">
                Ref
              </th>
              {/* Status */}
              <th className="w-20 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-r border-border">
                Result
              </th>
              {/* Frame columns */}
              {frameIndices.map((i) => (
                <th
                  key={i}
                  className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-r border-border last:border-r-0 min-w-[68px]"
                >
                  Frame {i}
                </th>
              ))}
              {/* Evicted */}
              <th className="w-16 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-l border-border">
                Out
              </th>
            </tr>
          </thead>
          <tbody>
            {result.steps.map((step, idx) => {
              const isFault = step.isFault;

              return (
                <tr
                  key={idx}
                  className={`border-b border-border/60 transition-colors group ${
                    isFault
                      ? "bg-red-50 hover:bg-red-100/70"
                      : "bg-card hover:bg-emerald-50/40"
                  }`}
                  style={
                    isFault
                      ? { boxShadow: "inset 4px 0 0 #ef4444" }
                      : { boxShadow: "inset 4px 0 0 transparent" }
                  }
                  data-testid={`row-${result.algorithm}-step-${idx + 1}`}
                >
                  {/* Step number */}
                  <td className="px-3 py-2.5 text-center border-r border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                      {idx + 1}
                    </span>
                  </td>

                  {/* Reference page chip */}
                  <td className="px-3 py-2.5 text-center border-r border-border/60">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-sm ${
                        isFault
                          ? "bg-red-100 text-red-700 ring-1 ring-red-300"
                          : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                      }`}
                    >
                      {step.page}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-2.5 text-center border-r border-border/60">
                    {isFault ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200"
                        data-testid={`badge-fault-${idx + 1}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        Fault
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200"
                        data-testid={`badge-hit-${idx + 1}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Hit
                      </span>
                    )}
                  </td>

                  {/* Frame cells */}
                  {step.frames.map((frame, fIdx) => {
                    const isNewlyLoaded = isFault && frame === step.page;
                    const isHitTarget   = !isFault && frame === step.page;
                    return (
                      <td
                        key={fIdx}
                        className="px-2 py-2.5 text-center border-r border-border/60 last:border-r-0"
                      >
                        <FrameCell
                          value={frame}
                          isNewlyLoaded={isNewlyLoaded}
                          isHitTarget={isHitTarget}
                          accentText={accentText}
                          accentBorder={accentBorder}
                        />
                      </td>
                    );
                  })}

                  {/* Evicted page */}
                  <td className="px-3 py-2.5 text-center border-l border-border/60">
                    {step.replacedPage !== null ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-semibold text-sm bg-red-50 text-red-400 ring-1 ring-red-200 line-through">
                        {step.replacedPage}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/25 text-sm select-none">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend + footer */}
      <div className="px-5 py-3 border-t border-border bg-muted/10 flex flex-wrap items-center justify-between gap-3">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border-2 border-dashed border-border/50 inline-block" />
            Empty slot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-border bg-muted/40 inline-block" />
            Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border-2 bg-red-50 border-red-300 inline-block" />
            Newly loaded
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border-2 bg-emerald-50 border-emerald-300 inline-block" />
            Cache hit
          </span>
        </div>
        {/* Totals */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{total} refs</span>
          <span className="text-red-600 font-semibold">
            {faultCount} faults ({(result.faultRatio * 100).toFixed(1)}%)
          </span>
          <span className="text-emerald-600 font-semibold">
            {hitCount} hits ({(result.hitRatio * 100).toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
