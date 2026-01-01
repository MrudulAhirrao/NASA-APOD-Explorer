package com.nasa.explorer;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableCaching

public class Application{
    public static void main(String[] args){
        Dotenv dotenv = Dotenv.configure()
                      .directory("./") 
                      .ignoreIfMissing()
                      .load();
        
        if (dotenv.get("NASA_API_KEY") != null) {
            System.setProperty("NASA_API_KEY", dotenv.get("NASA_API_KEY"));
        }
        SpringApplication.run(Application.class,args);
    }
    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}