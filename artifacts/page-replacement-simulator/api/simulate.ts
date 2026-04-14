import { SimulateBody } from "@workspace/api-zod";

interface SimulationStep {
  page: number;
  frames: (number | null)[];
  isFault: boolean;
  replacedPage: number | null;
}

interface AlgorithmResult {
  algorithm: string;
  steps: SimulationStep[];
  pageFaults: number;
  pageHits: number;
  hitRatio: number;
  faultRatio: number;
}

function runFIFO(pages: number[], numFrames: number): AlgorithmResult {
  const frames: (number | null)[] = new Array(numFrames).fill(null);
  const queue: number[] = [];
  const steps: SimulationStep[] = [];
  let pageFaults = 0;
  let pageHits = 0;

  for (const page of pages) {
    const inMemory = frames.includes(page);
    let replacedPage: number | null = null;

    if (inMemory) {
      pageHits++;
      steps.push({
        page,
        frames: [...frames],
        isFault: false,
        replacedPage: null,
      });
    } else {
      pageFaults++;
      if (queue.length < numFrames) {
        const emptyIndex = frames.indexOf(null);
        frames[emptyIndex] = page;
        queue.push(page);
      } else {
        const oldest = queue.shift()!;
        replacedPage = oldest;
        const idx = frames.indexOf(oldest);
        frames[idx] = page;
        queue.push(page);
      }
      steps.push({
        page,
        frames: [...frames],
        isFault: true,
        replacedPage,
      });
    }
  }

  const total = pages.length;
  return {
    algorithm: "FIFO",
    steps,
    pageFaults,
    pageHits,
    hitRatio: total > 0 ? pageHits / total : 0,
    faultRatio: total > 0 ? pageFaults / total : 0,
  };
}

function runLRU(pages: number[], numFrames: number): AlgorithmResult {
  const frames: (number | null)[] = new Array(numFrames).fill(null);
  const recentUse: number[] = [];
  const steps: SimulationStep[] = [];
  let pageFaults = 0;
  let pageHits = 0;

  for (const page of pages) {
    const inMemory = frames.includes(page);
    let replacedPage: number | null = null;

    if (inMemory) {
      pageHits++;
      const idx = recentUse.indexOf(page);
      if (idx !== -1) recentUse.splice(idx, 1);
      recentUse.push(page);
      steps.push({
        page,
        frames: [...frames],
        isFault: false,
        replacedPage: null,
      });
    } else {
      pageFaults++;
      if (frames.includes(null)) {
        const emptyIndex = frames.indexOf(null);
        frames[emptyIndex] = page;
      } else {
        const lru = recentUse.shift()!;
        replacedPage = lru;
        const idx = frames.indexOf(lru);
        frames[idx] = page;
      }
      recentUse.push(page);
      steps.push({
        page,
        frames: [...frames],
        isFault: true,
        replacedPage,
      });
    }
  }

  const total = pages.length;
  return {
    algorithm: "LRU",
    steps,
    pageFaults,
    pageHits,
    hitRatio: total > 0 ? pageHits / total : 0,
    faultRatio: total > 0 ? pageFaults / total : 0,
  };
}

function runOptimal(pages: number[], numFrames: number): AlgorithmResult {
  const frames: (number | null)[] = new Array(numFrames).fill(null);
  const steps: SimulationStep[] = [];
  let pageFaults = 0;
  let pageHits = 0;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const inMemory = frames.includes(page);
    let replacedPage: number | null = null;

    if (inMemory) {
      pageHits++;
      steps.push({
        page,
        frames: [...frames],
        isFault: false,
        replacedPage: null,
      });
    } else {
      pageFaults++;
      if (frames.includes(null)) {
        const emptyIndex = frames.indexOf(null);
        frames[emptyIndex] = page;
      } else {
        let farthest = -1;
        let pageToReplace = frames[0]!;
        for (const f of frames) {
          if (f === null) continue;
          const nextUse = pages.indexOf(f, i + 1);
          if (nextUse === -1) {
            pageToReplace = f;
            break;
          }
          if (nextUse > farthest) {
            farthest = nextUse;
            pageToReplace = f;
          }
        }
        replacedPage = pageToReplace;
        const idx = frames.indexOf(pageToReplace);
        frames[idx] = page;
      }
      steps.push({
        page,
        frames: [...frames],
        isFault: true,
        replacedPage,
      });
    }
  }

  const total = pages.length;
  return {
    algorithm: "Optimal",
    steps,
    pageFaults,
    pageHits,
    hitRatio: total > 0 ? pageHits / total : 0,
    faultRatio: total > 0 ? pageFaults / total : 0,
  };
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const parsed = SimulateBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { referenceString, frames, algorithm } = parsed.data;

  const pages = referenceString
    .trim()
    .split(/\s+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));

  if (pages.length === 0) {
    res.status(400).json({ error: "Reference string must contain at least one valid page number" });
    return;
  }

  const results: AlgorithmResult[] = [];

  if (algorithm === "FIFO" || algorithm === "ALL") {
    results.push(runFIFO(pages, frames));
  }
  if (algorithm === "LRU" || algorithm === "ALL") {
    results.push(runLRU(pages, frames));
  }
  if (algorithm === "Optimal" || algorithm === "ALL") {
    results.push(runOptimal(pages, frames));
  }

  res.status(200).json({
    results,
    referenceString: pages,
    frames,
  });
}