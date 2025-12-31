package com.nasa.explorer.service;

import com.nasa.explorer.model.ApodResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class NasaService {

    private static final Logger logger = LoggerFactory.getLogger(NasaService.class);
    private final RestTemplate restTemplate;

    @Value("${nasa.api.base-url}")
    private String baseUrl;

    @Value("${nasa.api.key}")
    private String apiKey;

    public NasaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // @Cacheable tells Spring: "Check 'apod' cache first. If found, skip this method."
    @Cacheable(value = "apod", key = "#date") 
    public ApodResponse getApod(String date) {
        logger.info("Fetching APOD from NASA API for date: {}", date);
        
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("api_key", apiKey)
                .queryParam("date", date)
                .toUriString();

        return restTemplate.getForObject(url, ApodResponse.class);
    }
}