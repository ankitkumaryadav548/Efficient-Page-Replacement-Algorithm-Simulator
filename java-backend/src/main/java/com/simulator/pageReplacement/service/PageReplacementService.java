package com.simulator.pageReplacement.service;

import com.simulator.pageReplacement.model.AlgorithmResult;
import com.simulator.pageReplacement.model.SimulationStep;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PageReplacementService {

    /**
     * FIFO — First In, First Out.
     * Replaces the page that has been in memory the longest.
     */
    public AlgorithmResult runFIFO(List<Integer> pages, int numFrames) {
        Integer[] frames = new Integer[numFrames];
        Arrays.fill(frames, null);
        Queue<Integer> fifoQueue = new LinkedList<>();
        List<SimulationStep> steps = new ArrayList<>();
        int pageFaults = 0;
        int pageHits = 0;

        for (int page : pages) {
            boolean inMemory = contains(frames, page);
            Integer replacedPage = null;

            if (inMemory) {
                pageHits++;
                steps.add(new SimulationStep(page, toList(frames), false, null));
            } else {
                pageFaults++;
                if (fifoQueue.size() < numFrames) {
                    int emptyIdx = findEmpty(frames);
                    frames[emptyIdx] = page;
                    fifoQueue.add(page);
                } else {
                    int oldest = fifoQueue.poll();
                    replacedPage = oldest;
                    int idx = indexOf(frames, oldest);
                    frames[idx] = page;
                    fifoQueue.add(page);
                }
                steps.add(new SimulationStep(page, toList(frames), true, replacedPage));
            }
        }

        return new AlgorithmResult("FIFO", steps, pageFaults, pageHits);
    }

    /**
     * LRU — Least Recently Used.
     * Replaces the page that was least recently accessed.
     */
    public AlgorithmResult runLRU(List<Integer> pages, int numFrames) {
        Integer[] frames = new Integer[numFrames];
        Arrays.fill(frames, null);
        LinkedList<Integer> recentList = new LinkedList<>();
        List<SimulationStep> steps = new ArrayList<>();
        int pageFaults = 0;
        int pageHits = 0;

        for (int page : pages) {
            boolean inMemory = contains(frames, page);
            Integer replacedPage = null;

            if (inMemory) {
                pageHits++;
                recentList.remove((Integer) page);
                recentList.addLast(page);
                steps.add(new SimulationStep(page, toList(frames), false, null));
            } else {
                pageFaults++;
                if (hasEmpty(frames)) {
                    int emptyIdx = findEmpty(frames);
                    frames[emptyIdx] = page;
                } else {
                    int lruPage = recentList.removeFirst();
                    replacedPage = lruPage;
                    int idx = indexOf(frames, lruPage);
                    frames[idx] = page;
                }
                recentList.addLast(page);
                steps.add(new SimulationStep(page, toList(frames), true, replacedPage));
            }
        }

        return new AlgorithmResult("LRU", steps, pageFaults, pageHits);
    }

    /**
     * Optimal — Bélády's Algorithm.
     * Replaces the page that will not be used for the longest time in future.
     */
    public AlgorithmResult runOptimal(List<Integer> pages, int numFrames) {
        Integer[] frames = new Integer[numFrames];
        Arrays.fill(frames, null);
        List<SimulationStep> steps = new ArrayList<>();
        int pageFaults = 0;
        int pageHits = 0;

        for (int i = 0; i < pages.size(); i++) {
            int page = pages.get(i);
            boolean inMemory = contains(frames, page);
            Integer replacedPage = null;

            if (inMemory) {
                pageHits++;
                steps.add(new SimulationStep(page, toList(frames), false, null));
            } else {
                pageFaults++;
                if (hasEmpty(frames)) {
                    int emptyIdx = findEmpty(frames);
                    frames[emptyIdx] = page;
                } else {
                    int victim = findOptimalVictim(frames, pages, i + 1);
                    replacedPage = victim;
                    int idx = indexOf(frames, victim);
                    frames[idx] = page;
                }
                steps.add(new SimulationStep(page, toList(frames), true, replacedPage));
            }
        }

        return new AlgorithmResult("Optimal", steps, pageFaults, pageHits);
    }

    /**
     * Finds the page in frames that will be used farthest in the future
     * (or never used again), making it the best candidate for replacement.
     */
    private int findOptimalVictim(Integer[] frames, List<Integer> pages, int fromIndex) {
        int farthest = -1;
        int victim = frames[0];

        for (Integer frame : frames) {
            if (frame == null) continue;
            int nextUse = indexOfFrom(pages, frame, fromIndex);
            if (nextUse == -1) {
                return frame;
            }
            if (nextUse > farthest) {
                farthest = nextUse;
                victim = frame;
            }
        }

        return victim;
    }

    private boolean contains(Integer[] frames, int page) {
        for (Integer f : frames) {
            if (f != null && f == page) return true;
        }
        return false;
    }

    private boolean hasEmpty(Integer[] frames) {
        for (Integer f : frames) {
            if (f == null) return true;
        }
        return false;
    }

    private int findEmpty(Integer[] frames) {
        for (int i = 0; i < frames.length; i++) {
            if (frames[i] == null) return i;
        }
        return -1;
    }

    private int indexOf(Integer[] frames, int page) {
        for (int i = 0; i < frames.length; i++) {
            if (frames[i] != null && frames[i] == page) return i;
        }
        return -1;
    }

    private int indexOfFrom(List<Integer> list, int value, int fromIndex) {
        for (int i = fromIndex; i < list.size(); i++) {
            if (list.get(i) == value) return i;
        }
        return -1;
    }

    private List<Integer> toList(Integer[] frames) {
        return new ArrayList<>(Arrays.asList(frames));
    }
}
