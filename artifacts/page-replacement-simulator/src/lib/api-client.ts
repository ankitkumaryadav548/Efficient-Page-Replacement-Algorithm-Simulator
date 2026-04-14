import { useMutation } from "@tanstack/react-query";

// Types
export interface HealthStatus {
  status: string;
}

export type SimulationRequestAlgorithm =
  (typeof SimulationRequestAlgorithm)[keyof typeof SimulationRequestAlgorithm];

export const SimulationRequestAlgorithm = {
  FIFO: "FIFO",
  LRU: "LRU",
  Optimal: "Optimal",
  ALL: "ALL",
} as const;

export interface SimulationRequest {
  /** Space-separated page numbers (e.g. "7 0 1 2 0 3 0 4") */
  referenceString: string;
  /**
   * Number of memory frames
   * @minimum 1
   * @maximum 20
   */
  frames: number;
  /** Algorithm to use */
  algorithm: SimulationRequestAlgorithm;
}

export interface SimulationStep {
  /** Page being referenced */
  page: number;
  /** Frame state after this step (null = empty) */
  frames: (number | null)[];
  /** Whether this step caused a page fault */
  isFault: boolean;
  /** Page that was replaced (if any) */
  replacedPage: number | null;
}

export interface AlgorithmResult {
  /** Algorithm name */
  algorithm: string;
  steps: SimulationStep[];
  /** Total number of page faults */
  pageFaults: number;
  /** Total number of page hits */
  pageHits: number;
  /** Hit ratio (0 to 1) */
  hitRatio: number;
  /** Fault ratio (0 to 1) */
  faultRatio: number;
}

export interface SimulationResponse {
  results: AlgorithmResult[];
  referenceString: number[];
  frames: number;
}

export interface ErrorResponse {
  error: string;
}

// API functions
const simulate = async (data: SimulationRequest): Promise<SimulationResponse> => {
  const response = await fetch('/api/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};

// Hooks
export const useSimulate = () => {
  return useMutation({
    mutationFn: simulate,
  });
};