package com.nasa.explorer.controller;

import com.nasa.explorer.model.ApodResponse;
import com.nasa.explorer.service.NasaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.nasa.explorer.dto.DateRangeRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/apod")
public class ApodController {

    private final NasaService nasaService;

    public ApodController(NasaService nasaService) {
        this.nasaService = nasaService;
    }

    // 1. Single Date Endpoint
    @GetMapping
    public ResponseEntity<?> getApod(@RequestParam(required = false) String date) {
        if (date == null) {
            date = java.time.LocalDate.now(java.time.ZoneId.of("America/New_York")).toString();
        }
        
        java.time.LocalDate requestedDate = java.time.LocalDate.parse(date);
        java.time.LocalDate nasaToday = java.time.LocalDate.now(java.time.ZoneId.of("America/New_York"));

        if (requestedDate.isAfter(nasaToday)) {
             return ResponseEntity.badRequest().body("Date cannot be in the future!");
        }

        return ResponseEntity.ok(nasaService.getApod(date));
    }

    
    @GetMapping("/range")
    public List<ApodResponse> getRecentApods(DateRangeRequest request) { 
        
        System.out.println("👉 BUCKET RECEIVED: " + request.getStart_date() + " to " + request.getEnd_date());

        if (request.getEnd_date() == null || request.getStart_date() == null) {
            String end = java.time.LocalDate.now(java.time.ZoneId.of("America/New_York")).minusDays(1).toString();
            String start = java.time.LocalDate.now(java.time.ZoneId.of("America/New_York")).minusDays(7).toString();
            return nasaService.getApodRange(start, end);
        }
        
        return nasaService.getApodRange(request.getStart_date(), request.getEnd_date());
    }
}