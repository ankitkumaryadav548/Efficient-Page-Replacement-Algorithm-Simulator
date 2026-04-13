package com.simulator.pageReplacement.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SimulationRequest {

    @NotBlank(message = "Reference string cannot be empty")
    @Size(max = 500, message = "Reference string is too long — maximum 500 characters")
    @Pattern(regexp = "^\\d+(\\s+\\d+)*$", message = "Reference string must contain space-separated whole numbers only (e.g. 7 0 1 2 0 3)")
    private String referenceString;

    @NotNull(message = "Number of frames is required")
    @Min(value = 1, message = "Frames must be at least 1")
    @Max(value = 20, message = "Frames cannot exceed 20")
    private Integer frames;

    @NotBlank(message = "Algorithm is required")
    @Pattern(regexp = "^(FIFO|LRU|Optimal|ALL)$", message = "Algorithm must be FIFO, LRU, Optimal, or ALL")
    private String algorithm;

    public SimulationRequest() {}

    public String getReferenceString() { return referenceString; }
    public void setReferenceString(String referenceString) { this.referenceString = referenceString; }

    public Integer getFrames() { return frames; }
    public void setFrames(Integer frames) { this.frames = frames; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
}
