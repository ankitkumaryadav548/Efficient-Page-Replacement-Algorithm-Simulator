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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Activity, BarChart3, Database } from "lucide-react";
import { SimulationResults } from "@/components/simulation-results";

const formSchema = z.object({
  referenceString: z.string().min(1, "Reference string is required").regex(/^(\d+\s)*\d+$/, "Must be space-separated numbers"),
  frames: z.coerce.number().min(1).max(20),
  algorithm: z.enum(["FIFO", "LRU", "Optimal", "ALL"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const { toast } = useToast();
  const [results, setResults] = useState<SimulationResponse | null>(null);

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
    simulateMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          setResults(response);
          toast({
            title: "Simulation Complete",
            description: "Successfully ran the page replacement algorithms.",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Simulation Failed",
            description: error.error?.error || "An unknown error occurred.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-md">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight leading-none text-foreground">Page Replacement Simulator</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Algorithm Visualization Tool</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Set up the memory simulation parameters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="referenceString"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference String</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 7 0 1 2 0 3 0 4"
                              data-testid="input-reference-string"
                              className="font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-[0.8rem] text-muted-foreground">Space-separated page numbers.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frames"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Memory Frames</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              data-testid="input-frames"
                              className="font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="algorithm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Algorithm</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-algorithm">
                                <SelectValue placeholder="Select an algorithm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FIFO">First-In, First-Out (FIFO)</SelectItem>
                              <SelectItem value="LRU">Least Recently Used (LRU)</SelectItem>
                              <SelectItem value="Optimal">Optimal</SelectItem>
                              <SelectItem value="ALL">Compare All</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      data-testid="button-run-simulation"
                      disabled={simulateMutation.isPending}
                    >
                      {simulateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        "Run Simulation"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                About Algorithms
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground mt-4">
                <div>
                  <strong className="text-foreground block mb-1">FIFO (First-In, First-Out)</strong>
                  <p>Replaces the oldest page in memory. Simple but can suffer from Belady's anomaly.</p>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">LRU (Least Recently Used)</strong>
                  <p>Replaces the page that has not been used for the longest time. Good approximation of Optimal.</p>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Optimal</strong>
                  <p>Replaces the page that will not be used for the longest time in the future. Impossible to implement perfectly in practice.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            {!results && !simulateMutation.isPending && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-muted/30">
                <div className="bg-background p-4 rounded-full shadow-sm border mb-4">
                  <Database className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">No Simulation Results</h2>
                <p className="text-muted-foreground max-w-sm">
                  Configure the parameters on the left and click "Run Simulation" to see how different algorithms manage memory frames over time.
                </p>
              </div>
            )}

            {simulateMutation.isPending && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-muted/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <h2 className="text-lg font-medium text-foreground">Running Simulation...</h2>
              </div>
            )}

            {results && !simulateMutation.isPending && (
              <SimulationResults data={results} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
