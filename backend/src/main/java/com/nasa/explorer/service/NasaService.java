package com.nasa.explorer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nasa.explorer.model.ApodResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.TimeUnit; 

@Service
public class NasaService {

    private static final Logger logger = LoggerFactory.getLogger(NasaService.class);

    @Value("${nasa.api.base-url}")
    private String baseUrl;

    @Value("${nasa.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private static final long CACHE_TTL = 24; 

    public ApodResponse getApod(String date) {
        String cacheKey = "apod:" + date;
        
        try {
            if (redisTemplate != null) {
                String cachedValue = redisTemplate.opsForValue().get(cacheKey);
                if (cachedValue != null) {
                    logger.info(" Cache HIT (Single) for: {}", date);
                    return objectMapper.readValue(cachedValue, ApodResponse.class);
                }
            }
        } catch (Exception e) {
            logger.warn(" Redis unavailable. Skipping read.");
        }

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("api_key", apiKey)
                .queryParam("date", date)
                .toUriString();

        try {
            logger.info(" Calling NASA API for: {}", date);
            ApodResponse response = restTemplate.getForObject(url, ApodResponse.class);
            
            if (response != null) {
                try {
                    if (redisTemplate != null) {
                        redisTemplate.opsForValue().set(
                            cacheKey, 
                            objectMapper.writeValueAsString(response),
                            CACHE_TTL, 
                            TimeUnit.HOURS
                        );
                        logger.info(" Cached result for 24 hours.");
                    }
                } catch (Exception e) {
                    logger.warn(" Redis unavailable. Skipping write.");
                }
                return response;
            }
        } catch (Exception e) {
            logger.error(" NASA API Failed. Using Fallback.");
            return getMockApod(date);
        }
        return getMockApod(date);
    }

    public List<ApodResponse> getApodRange(String startDate, String endDate) {
        String cacheKey = "apod-range:" + startDate + ":" + endDate;
        
        try {
            if (redisTemplate != null) {
                String cachedValue = redisTemplate.opsForValue().get(cacheKey);
                if (cachedValue != null) {
                    logger.info("✅ Cache HIT (Range) for: {}", startDate);
                    return objectMapper.readValue(cachedValue, new TypeReference<List<ApodResponse>>(){});
                }
            }
        } catch (Exception e) {
            logger.warn(" Redis unavailable. Skipping read.");
        }

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("api_key", apiKey)
                .queryParam("start_date", startDate)
                .queryParam("end_date", endDate)
                .toUriString();

        try {
            ApodResponse[] response = restTemplate.getForObject(url, ApodResponse[].class);
            if (response != null) {
                List<ApodResponse> list = new ArrayList<>(Arrays.asList(response));
                list.sort((a, b) -> b.getDate().compareTo(a.getDate()));

                try {
                    if (redisTemplate != null) {
                        redisTemplate.opsForValue().set(
                            cacheKey, 
                            objectMapper.writeValueAsString(list),
                            CACHE_TTL, 
                            TimeUnit.HOURS
                        );
                    }
                } catch (Exception e) {
                    logger.warn(" Redis unavailable. Skipping write.");
                }
                return list;
            }
        } catch (Exception e) {
            logger.error(" NASA API Failed. Using Fallback.");
            return generateMockRange(startDate, endDate);
        }
        return Collections.emptyList();
    }

    // --- MOCK DATA FALLBACKS ---
    private ApodResponse getMockApod(String date) {
        ApodResponse mock = new ApodResponse();
        mock.setDate(date);
        mock.setTitle("Mock Mode: Cosmos for " + date); 
        mock.setExplanation("NASA API limit reached or network error. Showing cached fallback data.");
        mock.setMedia_type("image");
        mock.setHdurl("https://upload.wikimedia.org/wikipedia/commons/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg");
        mock.setUrl("https://upload.wikimedia.org/wikipedia/commons/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg");
        return mock;
    }

    private List<ApodResponse> generateMockRange(String startDate, String endDate) {
        List<ApodResponse> mockList = new ArrayList<>();
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        LocalDate current = end;
        int safetyCounter = 0;
        while (!current.isBefore(start) && safetyCounter < 10) {
            mockList.add(getMockApod(current.toString()));
            current = current.minusDays(1);
            safetyCounter++;
        }
        return mockList;
    }
}