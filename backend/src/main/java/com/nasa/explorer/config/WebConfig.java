package com.nasa.explorer.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply Rate Limiting to ALL endpoints starting with /api/
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**"); 
                // Note: We intentionally exclude /swagger-ui so documentation is always accessible
    }
}