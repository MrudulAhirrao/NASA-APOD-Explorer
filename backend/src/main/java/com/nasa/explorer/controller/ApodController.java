package com.nasa.explorer.controller;

import com.nasa.explorer.service.NasaService;
import com.nasa.explorer.model.ApodResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import io.github.bucket4j.Bucket;
import java.time.LocalDate;


@RestController
@RequestMapping("api/v1/apod")
@CrossOrigin(origins="*")

public class ApodController {

    private final NasaService nasaService;
    private final Bucket bucket;

    public ApodController(NasaService nasaService, Bucket bucket){
        this.nasaService = nasaService;
        this.bucket = bucket;
    }
    @GetMapping
    public ResponseEntity<?> getApod(@RequestParam(required = false) String date){
        if (bucket.tryConsume(1)) {
            if (date == null) {
            date = LocalDate.now().toString();
            }
            return ResponseEntity.ok(nasaService.getApod(date));
        }else{
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests! Please try again later.");
        }
    }
}