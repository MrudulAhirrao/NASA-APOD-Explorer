package com.nasa.explorer.dto;

public class DateRangeRequest {
    // The names must match your URL params exactly
    private String start_date;
    private String end_date;

    // Standard Getters and Setters (Spring uses these to fill the bucket)
    public String getStart_date() { return start_date; }
    public void setStart_date(String start_date) { this.start_date = start_date; }

    public String getEnd_date() { return end_date; }
    public void setEnd_date(String end_date) { this.end_date = end_date; }
}