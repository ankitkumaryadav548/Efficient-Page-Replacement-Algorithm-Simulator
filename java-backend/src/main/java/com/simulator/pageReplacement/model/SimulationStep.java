package com.simulator.pageReplacement.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SimulationStep {

    private int page;
    private List<Integer> frames;
    private boolean fault;
    private Integer replacedPage;

    public SimulationStep(int page, List<Integer> frames, boolean fault, Integer replacedPage) {
        this.page = page;
        this.frames = frames;
        this.fault = fault;
        this.replacedPage = replacedPage;
    }

    public int getPage() { return page; }
    public List<Integer> getFrames() { return frames; }

    @JsonProperty("isFault")
    public boolean isFault() { return fault; }

    public Integer getReplacedPage() { return replacedPage; }
}
