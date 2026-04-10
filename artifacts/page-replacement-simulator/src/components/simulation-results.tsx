import type { AlgorithmResult, SimulationResponse } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface SimulationResultsProps {
  data: SimulationResponse;
}

export function SimulationResults({ data }: SimulationResultsProps) {
  const chartData = data.results.map(r => ({
    name: r.algorithm,
    faults: r.pageFaults,
    hits: r.pageHits,
  }));

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Chart Section */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>Page faults across evaluated algorithms.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full" data-testid="chart-performance">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  dx={-10} 
                />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
                />
                <Bar 
                  dataKey="faults" 
                  name="Page Faults" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Results Tables */}
      <div className="space-y-8">
        {data.results.map((result) => (
          <AlgorithmDetails key={result.algorithm} result={result} frames={data.frames} />
        ))}
      </div>
    </div>
  );
}

function AlgorithmDetails({ result, frames }: { result: AlgorithmResult; frames: number }) {
  // Generate an array of frame indices for the table headers [0, 1, 2, ...]
  const frameIndices = Array.from({ length: frames }, (_, i) => i);

  return (
    <Card className="shadow-sm overflow-hidden" data-testid={`results-${result.algorithm}`}>
      <CardHeader className="bg-muted/30 border-b py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{result.algorithm} Algorithm</CardTitle>
            <CardDescription className="mt-1">Step-by-step memory state execution</CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col bg-background border px-3 py-1.5 rounded-md">
              <span className="text-[0.65rem] uppercase text-muted-foreground font-semibold tracking-wider">Faults</span>
              <span className="font-mono text-lg leading-tight font-bold text-destructive" data-testid={`text-faults-${result.algorithm}`}>
                {result.pageFaults}
              </span>
            </div>
            <div className="flex flex-col bg-background border px-3 py-1.5 rounded-md">
              <span className="text-[0.65rem] uppercase text-muted-foreground font-semibold tracking-wider">Hits</span>
              <span className="font-mono text-lg leading-tight font-bold text-emerald-600" data-testid={`text-hits-${result.algorithm}`}>
                {result.pageHits}
              </span>
            </div>
            <div className="flex flex-col bg-background border px-3 py-1.5 rounded-md">
              <span className="text-[0.65rem] uppercase text-muted-foreground font-semibold tracking-wider">Ratio</span>
              <span className="font-mono text-lg leading-tight font-bold text-foreground" data-testid={`text-ratio-${result.algorithm}`}>
                {(result.hitRatio * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="w-16 text-center font-semibold">Step</TableHead>
              <TableHead className="w-20 text-center font-semibold">Page</TableHead>
              <TableHead className="text-center font-semibold">Status</TableHead>
              {frameIndices.map(i => (
                <TableHead key={i} className="text-center font-mono font-medium border-l">Frame {i}</TableHead>
              ))}
              <TableHead className="text-center font-semibold border-l">Replaced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono">
            {result.steps.map((step, idx) => {
              const isFault = step.isFault;
              return (
                <TableRow 
                  key={idx} 
                  className={isFault ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/30"}
                  data-testid={`row-${result.algorithm}-step-${idx + 1}`}
                >
                  <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="text-center font-bold text-foreground bg-muted/10 border-x">
                    {step.page}
                  </TableCell>
                  <TableCell className="text-center">
                    {isFault ? (
                      <Badge variant="destructive" className="rounded-sm font-semibold uppercase text-[10px] px-1.5 h-5 bg-destructive text-destructive-foreground" data-testid={`badge-fault-${idx+1}`}>
                        Fault
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-sm font-semibold uppercase text-[10px] px-1.5 h-5 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900" data-testid={`badge-hit-${idx+1}`}>
                        Hit
                      </Badge>
                    )}
                  </TableCell>
                  
                  {/* Render the frames */}
                  {step.frames.map((frame, frameIdx) => (
                    <TableCell 
                      key={frameIdx} 
                      className={`text-center border-l ${frame === null ? "text-muted-foreground/30" : "font-medium"}`}
                    >
                      {frame === null ? "-" : frame}
                    </TableCell>
                  ))}
                  
                  <TableCell className="text-center text-muted-foreground border-l">
                    {step.replacedPage !== null ? step.replacedPage : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
