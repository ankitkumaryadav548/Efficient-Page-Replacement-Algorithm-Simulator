import type { AlgorithmResult, SimulationResponse } from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Cell, LabelList,
} from "recharts";

interface SimulationResultsProps {
  data: SimulationResponse;
}

const ALGO_COLORS = {
  FIFO:    { bar: "hsl(243 75% 59%)", bg: "hsl(243 75% 59% / 0.08)", border: "hsl(243 75% 59% / 0.25)", text: "hsl(243 75% 45%)" },
  LRU:     { bar: "hsl(173 58% 39%)", bg: "hsl(173 58% 39% / 0.08)", border: "hsl(173 58% 39% / 0.25)", text: "hsl(173 58% 30%)" },
  Optimal: { bar: "hsl(35 91% 55%)",  bg: "hsl(35 91% 55% / 0.08)",  border: "hsl(35 91% 55% / 0.25)",  text: "hsl(35 91% 35%)"  },
};
const FALLBACK_COLORS = ["hsl(243 75% 59%)", "hsl(173 58% 39%)", "hsl(35 91% 55%)"];

function getColor(algo: string, idx: number) {
  return ALGO_COLORS[algo as keyof typeof ALGO_COLORS]?.bar ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

export function SimulationResults({ data }: SimulationResultsProps) {
  const chartData = data.results.map((r) => ({
    name: r.algorithm,
    Faults: r.pageFaults,
    Hits: r.pageHits,
  }));

  const maxValue = Math.max(...data.results.map(r => r.pageFaults + r.pageHits));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

      {/* Performance chart */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Performance Comparison</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Page faults vs. hits per algorithm</p>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block bg-destructive/70" />
              Faults
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-500/70" />
              Hits
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="h-[260px]" data-testid="chart-performance">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 4 }} barGap={4} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif" }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "Inter, sans-serif" }}
                  dx={-4}
                  domain={[0, maxValue + 1]}
                />
                <RechartsTooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)", radius: 4 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                    fontFamily: "Inter, sans-serif",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Bar dataKey="Faults" radius={[5, 5, 0, 0]} maxBarSize={52}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`fault-${index}`}
                      fill={getColor(entry.name, index)}
                      fillOpacity={0.85}
                    />
                  ))}
                  <LabelList dataKey="Faults" position="top" style={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--muted-foreground))", fontFamily: "Inter" }} />
                </Bar>
                <Bar dataKey="Hits" radius={[5, 5, 0, 0]} maxBarSize={52} fill="hsl(160 60% 50%)" fillOpacity={0.5}>
                  <LabelList dataKey="Hits" position="top" style={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--muted-foreground))", fontFamily: "Inter" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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

function AlgorithmTable({ result, totalFrames }: { result: AlgorithmResult; totalFrames: number }) {
  const frameIndices = Array.from({ length: totalFrames }, (_, i) => i);
  const colors = ALGO_COLORS[result.algorithm as keyof typeof ALGO_COLORS];
  const accentBg = colors?.bg ?? "hsl(var(--muted) / 0.5)";
  const accentBorder = colors?.border ?? "hsl(var(--border))";
  const accentText = colors?.text ?? "hsl(var(--primary))";

  const faultCount = result.pageFaults;
  const hitCount = result.pageHits;
  const total = faultCount + hitCount;

  return (
    <div
      className="bg-card rounded-xl shadow-sm overflow-hidden border"
      style={{ borderColor: accentBorder }}
      data-testid={`results-${result.algorithm}`}
    >
      {/* Table header */}
      <div className="px-5 py-3.5 border-b" style={{ background: accentBg, borderColor: accentBorder }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-base" style={{ color: accentText }}>{result.algorithm} Algorithm</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Step-by-step memory frame states</p>
          </div>
          {/* Compact stats */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-2.5 py-1 rounded-lg text-xs font-semibold border border-destructive/20">
              <span className="font-mono text-sm font-bold">{faultCount}</span>
              <span>faults</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-200">
              <span className="font-mono text-sm font-bold">{hitCount}</span>
              <span>hits</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-lg text-xs font-semibold border border-border"
              data-testid={`text-ratio-${result.algorithm}`}>
              <span className="font-mono text-sm font-bold text-foreground">{(result.hitRatio * 100).toFixed(1)}%</span>
              <span>hit rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto results-scroll">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/30">
              <th className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2.5 w-12 border-r border-border">#</th>
              <th className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2.5 w-14 border-r border-border">Page</th>
              <th className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2.5 w-20 border-r border-border">Status</th>
              {frameIndices.map(i => (
                <th key={i} className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2.5 border-r border-border last:border-r-0 min-w-[52px]">
                  F{i}
                </th>
              ))}
              <th className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2.5 border-l border-border">Out</th>
            </tr>
          </thead>
          <tbody className="font-mono divide-y divide-border">
            {result.steps.map((step, idx) => {
              const isFault = step.isFault;
              return (
                <tr
                  key={idx}
                  className={`transition-colors ${isFault ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-muted/30"}`}
                  style={isFault ? { boxShadow: "inset 3px 0 0 hsl(0 84% 60%)" } : {}}
                  data-testid={`row-${result.algorithm}-step-${idx + 1}`}
                >
                  {/* Step # */}
                  <td className="text-center text-muted-foreground text-xs py-2 px-3 border-r border-border">{idx + 1}</td>

                  {/* Page */}
                  <td className="text-center py-2 px-3 border-r border-border">
                    <span className="font-bold text-foreground text-sm">{step.page}</span>
                  </td>

                  {/* Status badge */}
                  <td className="text-center py-2 px-3 border-r border-border">
                    {isFault ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-destructive/15 text-destructive border border-destructive/25"
                        data-testid={`badge-fault-${idx + 1}`}
                      >
                        FAULT
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200"
                        data-testid={`badge-hit-${idx + 1}`}
                      >
                        HIT
                      </span>
                    )}
                  </td>

                  {/* Frame cells */}
                  {step.frames.map((frame, fIdx) => {
                    const isNewPage = frame === step.page && isFault;
                    return (
                      <td
                        key={fIdx}
                        className={`text-center py-2 px-3 border-r border-border last:border-r-0 text-sm transition-all ${
                          frame === null
                            ? "text-muted-foreground/30"
                            : isNewPage
                            ? "font-bold"
                            : "font-medium text-foreground"
                        }`}
                        style={isNewPage ? { color: accentText } : undefined}
                      >
                        {frame === null ? "—" : frame}
                      </td>
                    );
                  })}

                  {/* Replaced page */}
                  <td className="text-center py-2 px-3 border-l border-border text-muted-foreground text-xs">
                    {step.replacedPage !== null ? (
                      <span className="font-mono font-semibold text-destructive/70">{step.replacedPage}</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary bar */}
      <div className="px-5 py-2.5 border-t border-border bg-muted/20 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{total} references total</span>
        <span>·</span>
        <span className="text-destructive font-medium">{faultCount} faults ({(result.faultRatio * 100).toFixed(1)}%)</span>
        <span>·</span>
        <span className="text-emerald-600 font-medium">{hitCount} hits ({(result.hitRatio * 100).toFixed(1)}%)</span>
      </div>
    </div>
  );
}
