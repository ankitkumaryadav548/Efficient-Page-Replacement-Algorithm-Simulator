package com.simulator.pageReplacement.controller;

import com.simulator.pageReplacement.model.AlgorithmResult;
import com.simulator.pageReplacement.model.SimulationRequest;
import com.simulator.pageReplacement.model.SimulationResponse;
import com.simulator.pageReplacement.service.PageReplacementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class SimulationController {

    private final PageReplacementService service;

    public SimulationController(PageReplacementService service) {
        this.service = service;
    }

    @GetMapping("/healthz")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> simulate(@Valid @RequestBody SimulationRequest request) {
        List<Integer> pages = parseReferenceString(request.getReferenceString());
        if (pages.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Reference string must contain at least one valid page number"));
        }

        int numFrames = request.getFrames();
        String algorithm = request.getAlgorithm();
        List<AlgorithmResult> results = new ArrayList<>();

        if ("FIFO".equals(algorithm) || "ALL".equals(algorithm)) {
            results.add(service.runFIFO(pages, numFrames));
        }
        if ("LRU".equals(algorithm) || "ALL".equals(algorithm)) {
            results.add(service.runLRU(pages, numFrames));
        }
        if ("Optimal".equals(algorithm) || "ALL".equals(algorithm)) {
            results.add(service.runOptimal(pages, numFrames));
        }

        return ResponseEntity.ok(new SimulationResponse(results, pages, numFrames));
    }

    private List<Integer> parseReferenceString(String input) {
        return Arrays.stream(input.trim().split("\\s+"))
                .map(s -> {
                    try { return Integer.parseInt(s); }
                    catch (NumberFormatException e) { return null; }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
