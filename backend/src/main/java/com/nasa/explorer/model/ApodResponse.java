package com.nasa.explorer.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.io.Serializable;

@Data

public class ApodResponse implements Serializable{
    private String Date;
    private String explanation;
    private String title;
    private String url;

    @JsonProperty("hdurl")
    private String hdUrl;

    @JsonProperty("media_type")
    private String mediaType;

    private String copyright;
}