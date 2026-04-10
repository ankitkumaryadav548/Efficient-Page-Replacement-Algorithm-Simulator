package com.simulator.pageReplacement.model;

import java.util.List;

public class AlgorithmResult {

    private String algorithm;
    private List<SimulationStep> steps;
    private int pageFaults;
    private int pageHits;
    private double hitRatio;
    private double faultRatio;

    public AlgorithmResult(String algorithm, List<SimulationStep> steps, int pageFaults, int pageHits) {
        this.algorithm = algorithm;
        this.steps = steps;
        this.pageFaults = pageFaults;
        this.pageHits = pageHits;
        int total = pageFaults + pageHits;
        this.hitRatio = total > 0 ? (double) pageHits / total : 0.0;
        this.faultRatio = total > 0 ? (double) pageFaults / total : 0.0;
    }

    public String getAlgorithm() { return algorithm; }
    public List<SimulationStep> getSteps() { return steps; }
    public int getPageFaults() { return pageFaults; }
    public int getPageHits() { return pageHits; }
    public double getHitRatio() { return hitRatio; }
    public double getFaultRatio() { return faultRatio; }
}
