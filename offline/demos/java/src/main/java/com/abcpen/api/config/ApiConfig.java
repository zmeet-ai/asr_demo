package com.abcpen.api.config;

public class ApiConfig {
    private ApiConfig() {}
    
    public static final String BASE_URL = "https://audio.abcpen.com:8443";
    public static final int DEFAULT_TIMEOUT = 5000;
    public static final int MAX_RETRIES = 3;
}