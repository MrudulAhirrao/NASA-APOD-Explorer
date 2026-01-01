package com.nasa.explorer.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApodResponse {
    private String date;
    private String explanation;
    private String hdurl;
    
    @JsonProperty("hdurl")
    private String hdUrl; 
    
    private String media_type;
    private String service_version;
    private String title;
    private String url;
    private String copyright;

    // --- GETTERS ---
    public String getDate() { return date; }
    public String getExplanation() { return explanation; }
    public String getHdurl() { return hdurl != null ? hdurl : hdUrl; }
    public String getMedia_type() { return media_type; }
    public String getTitle() { return title; }
    public String getUrl() { return url; }

    // --- SETTERS (Crucial for Mock Mode) ---
    public void setDate(String date) { this.date = date; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public void setHdurl(String hdurl) { this.hdurl = hdurl; }
    public void setMedia_type(String media_type) { this.media_type = media_type; }
    public void setTitle(String title) { this.title = title; }
    public void setUrl(String url) { this.url = url; }
    public void setCopyright(String copyright) { this.copyright = copyright; }
}