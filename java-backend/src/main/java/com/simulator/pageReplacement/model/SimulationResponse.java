package com.simulator.pageReplacement.model;

import java.util.List;

public class SimulationResponse {

    private List<AlgorithmResult> results;
    private List<Integer> referenceString;
    private int frames;

    public SimulationResponse(List<AlgorithmResult> results, List<Integer> referenceString, int frames) {
        this.results = results;
        this.referenceString = referenceString;
        this.frames = frames;
    }

    public List<AlgorithmResult> getResults() { return results; }
    public List<Integer> getReferenceString() { return referenceString; }
    public int getFrames() { return frames; }
}
