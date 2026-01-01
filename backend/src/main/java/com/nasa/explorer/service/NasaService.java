package com.nasa.explorer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nasa.explorer.model.ApodResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.*;

@Service
public class NasaService {

    private static final Logger logger = LoggerFactory.getLogger(NasaService.class);

    @Autowired
    private final RestTemplate restTemplate;
    
    @Autowired(required = false)
    private final StringRedisTemplate redisTemplate;
    
    private final ObjectMapper objectMapper;

    @Value("${nasa.api.base-url}")
    private String baseUrl;

    @Value("${nasa.api.key}")
    private String apiKey;

    public NasaService(RestTemplate restTemplate, 
                       StringRedisTemplate redisTemplate, 
                       ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public ApodResponse getApod(String date) {
        String cacheKey = "apod:" + date;
        
        // ✅ FIX 3: Wrap Redis Read in Try-Catch (The Crash Stopper)
        try {
            if (redisTemplate != null) {
                String cachedValue = redisTemplate.opsForValue().get(cacheKey);
                if (cachedValue != null) {
                    logger.info("✅ Cache HIT for date: {}", date);
                    return objectMapper.readValue(cachedValue, ApodResponse.class);
                }
            }
        } catch (Exception e) {
            logger.warn("⚠️ Redis unavailable. Skipping cache read.");
        }

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("api_key", apiKey)
                .queryParam("date", date)
                .toUriString();

        try {
            logger.info("Calling NASA API for date: {}", date);
            ApodResponse response = restTemplate.getForObject(url, ApodResponse.class);
            
            if (response != null) {
                // ✅ FIX 4: Wrap Redis Write in Try-Catch
                try {
                    if (redisTemplate != null) {
                        redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(response));
                    }
                } catch (Exception e) {
                    logger.warn("⚠️ Redis unavailable. Skipping cache write.");
                }
                return response;
            }
        } catch (Exception e) {
            logger.error("❌ NASA API failed: {}. Switching to MOCK MODE.", e.getMessage());
            return getMockApod(date);
        }
        
        return getMockApod(date);
    }

    private ApodResponse getMockApod(String date) {
        ApodResponse mock = new ApodResponse();
        mock.setDate(date);
        mock.setTitle("Mock Mode: Cosmos for " + date); 
        mock.setExplanation("NASA limit reached. Showing cached fallback for " + date);
        mock.setMedia_type("image");
        mock.setHdurl("https://upload.wikimedia.org/wikipedia/commons/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg");
        mock.setUrl("https://upload.wikimedia.org/wikipedia/commons/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg");
        return mock;
    }


    public List<ApodResponse> getApodRange(String startDate, String endDate) {
        String cacheKey = "apod-range:" + startDate + ":" + endDate;
        
        // 1. TRY READING REDIS (But don't crash if it fails)
        try {
            if (redisTemplate != null) {
                String cachedValue = redisTemplate.opsForValue().get(cacheKey);
                if (cachedValue != null) {
                    logger.info("✅ Cache HIT for range: " + startDate);
                    return objectMapper.readValue(cachedValue, new TypeReference<List<ApodResponse>>(){});
                }
            }
        } catch (Exception e) {
            logger.warn("⚠️ Redis unavailable or connection failed. Skipping cache read.");
        }

        // 2. BUILD NASA URL
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("api_key", apiKey)
                .queryParam("start_date", startDate)
                .queryParam("end_date", endDate)
                .toUriString();

        try {
            // 3. CALL NASA API
            ApodResponse[] response = restTemplate.getForObject(url, ApodResponse[].class);
            if (response != null) {
                List<ApodResponse> list = new ArrayList<>(Arrays.asList(response));
                // Sort Newest First
                list.sort((a, b) -> b.getDate().compareTo(a.getDate()));

                // 4. TRY SAVING TO REDIS (But don't crash if it fails)
                try {
                    if (redisTemplate != null) {
                        redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(list));
                    }
                } catch (Exception e) {
                    logger.warn("⚠️ Redis unavailable. Skipping cache write.");
                }
                
                return list;
            }
        } catch (Exception e) {
            // 5. CATCH ALL ERRORS (429 Rate Limit, 500 NASA Error, etc.)
            logger.error("❌ API Failed. Switching to Mock Mode. Error: " + e.getMessage());
            return generateMockRange(startDate, endDate);
        }
        return Collections.emptyList();
    }

    private List<ApodResponse> generateMockRange(String startDate, String endDate) {
        List<ApodResponse> mockList = new java.util.ArrayList<>();
        
        java.time.LocalDate start = java.time.LocalDate.parse(startDate);
        java.time.LocalDate end = java.time.LocalDate.parse(endDate);

        java.time.LocalDate current = end;
        while (!current.isBefore(start)) {
            mockList.add(getMockApod(current.toString()));
            current = current.minusDays(1);
        }
        return mockList;
    }


}