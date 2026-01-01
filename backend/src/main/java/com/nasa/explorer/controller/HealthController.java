package com.nasa.explorer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @GetMapping
    public ResponseEntity<?> checkHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("application", "UP");
        
        try {
            // Ping Redis to see if it's alive
            redisTemplate.opsForValue().set("health-check", "ok");
            String value = redisTemplate.opsForValue().get("health-check");
            status.put("redis", "UP");
        } catch (Exception e) {
            status.put("redis", "DOWN");
            return ResponseEntity.status(503).body(status);
        }

        return ResponseEntity.ok(status);
    }
}