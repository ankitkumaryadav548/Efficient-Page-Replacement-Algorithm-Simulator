import { useState } from "react";
import { useSimulate } from "@workspace/api-client-react";
import type { SimulationResponse } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Cpu, GitBranch, Zap, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { SimulationResults } from "@/components/simulation-results";

const formSchema = z.object({
  // Normalise whitespace before validating so "7  0  1" and " 7 0 1 " both work
  referenceString: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v),
    z.string()
      .min(1, "Reference string cannot be empty")
      .regex(
        /^\d+( \d+)*$/,
        "Enter space-separated whole numbers only — e.g. 7 0 1 2 0 3 0 4",
      )
      .refine(
        (s) => s.split(" ").length >= 1,
        "Enter at least one page number",
      )
      .refine(
        (s) => s.split(" ").length <= 50,
        "Maximum 50 page references allowed",
      )
      .refine(
        (s) => s.split(" ").every((n) => parseInt(n, 10) <= 255),
        "Each page number must be between 0 and 255",
      ),
  ),

  frames: z.coerce
    .number({
      invalid_type_error: "Frames must be a number",
      required_error: "Number of frames is required",
    })
    .int("Frames must be a whole number — no decimals")
    .min(1, "At least 1 frame is required")
    .max(20, "Maximum 20 frames allowed"),

  algorithm: z.enum(["FIFO", "LRU", "Optimal", "ALL"], {
    errorMap: () => ({ message: "Please select a valid algorithm" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ALGORITHMS = [
  { value: "FIFO", label: "FIFO", sublabel: "First-In, First-Out" },
  { value: "LRU",  label: "LRU",  sublabel: "Least Recently Used" },
  { value: "Optimal", label: "Optimal", sublabel: "Bélády's Algorithm" },
  { value: "ALL",  label: "Compare All", sublabel: "FIFO + LRU + Optimal" },
];

const ALGO_INFO = [
  {
    icon: <GitBranch className="w-4 h-4" />,
    name: "FIFO",
    desc: "Evicts the oldest page. Simple but can cause Bélády's anomaly — more frames may yield more faults.",
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    name: "LRU",
    desc: "Evicts the page unused for the longest time. A strong practical heuristic with no anomaly.",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    name: "Optimal",
    desc: "Evicts the page needed farthest in the future. Theoretically perfect — impossible in real systems.",
  },
];

export default function Home() {
  const [results, setResults] = useState<SimulationResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referenceString: "7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1",
      frames: 3,
      algorithm: "ALL",
    },
  });

  const simulateMutation = useSimulate();

  function onSubmit(data: FormValues) {
    setApiError(null);
    simulateMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          setResults(response);
          setApiError(null);
        },
        onError: (err) => {
          // ApiError shape: { status: number, data: { error?: string }, message: string }
          const apiErr = err as { status?: number; data?: { error?: string }; message?: string };
          const serverMsg = apiErr.data?.error;
          const status    = apiErr.status ?? 0;

          let msg: string;
          if (serverMsg) {
            // Server returned a structured validation / logic error — show it as-is
            msg = serverMsg;
          } else if (status === 0 || !status) {
            msg = "Could not reach the simulation server. Make sure the backend is running.";
          } else if (status >= 500) {
            msg = "The server encountered an error. Please try again in a moment.";
          } else {
            msg = apiErr.message ?? "An unexpected error occurred. Please try again.";
          }

          setApiError(msg);
          setResults(null);
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-xs sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-foreground tracking-tight">Page Replacement Simulator</span>
            <span className="hidden sm:inline text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-full">FIFO · LRU · Optimal</span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

        {/* Left panel */}
        <aside className="flex flex-col gap-4">

          {/* Configuration card */}
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/40">
              <h2 className="font-semibold text-sm text-foreground tracking-tight">Configuration</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Set simulation parameters</p>
            </div>
            <div className="p-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  {/* Reference String */}
                  <FormField
                    control={form.control}
                    name="referenceString"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Reference String
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 7 0 1 2 0 3 0 4"
                            data-testid="input-reference-string"
                            className="font-mono text-sm h-9 bg-background"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground">Space-separated page numbers</p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Frames */}
                  <FormField
                    control={form.control}
                    name="frames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Memory Frames
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            data-testid="input-frames"
                            className="font-mono text-sm h-9 bg-background w-28"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground">Between 1 and 20</p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Algorithm */}
                  <FormField
                    control={form.control}
                    name="algorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Algorithm
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-algorithm" className="h-9 bg-background text-sm">
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ALGORITHMS.map(algo => (
                              <SelectItem key={algo.value} value={algo.value}>
                                <span className="font-medium">{algo.label}</span>
                                <span className="ml-1.5 text-muted-foreground text-xs">— {algo.sublabel}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-9 font-semibold text-sm shadow-sm mt-2"
                    data-testid="button-run-simulation"
                    disabled={simulateMutation.isPending}
                  >
                    {simulateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-3.5 w-3.5" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* Algorithm info card */}
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About Algorithms</h3>
            </div>
            <div className="p-5 space-y-4">
              {ALGO_INFO.map((a) => (
                <div key={a.name} className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none mb-1">{a.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right results area */}
        <main className="min-w-0 flex flex-col gap-4">
          {/* Error banner */}
          {apiError && !simulateMutation.isPending && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-4 text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-destructive">Simulation Failed</p>
                <p className="text-destructive/80 mt-0.5 break-words">{apiError}</p>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="text-destructive/60 hover:text-destructive transition-colors flex-shrink-0"
                aria-label="Dismiss error"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Empty state */}
          {!results && !simulateMutation.isPending && !apiError && (
            <div className="flex flex-col items-center justify-center min-h-[420px] border-2 border-dashed border-border rounded-xl bg-card/50 text-center p-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Cpu className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">No Simulation Results</h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Configure the parameters on the left and click "Run Simulation" to see step-by-step memory states.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {["FIFO", "LRU", "Optimal"].map(algo => (
                  <span key={algo} className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {algo}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {simulateMutation.isPending && (
            <div className="flex flex-col items-center justify-center min-h-[420px] border border-border rounded-xl bg-card text-center p-10">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm font-medium text-foreground">Running algorithms...</p>
              <p className="text-xs text-muted-foreground mt-1">Calculating optimal page replacements</p>
            </div>
          )}

          {/* Results */}
          {results && !simulateMutation.isPending && (
            <SimulationResults data={results} />
          )}
        </main>
      </div>
    </div>
  );
}
