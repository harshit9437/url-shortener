package com.URLShortner.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Long urlId;
    private String shortCode;
    private String originalUrl;
    private LocalDateTime from;
    private LocalDateTime to;
    private Long totalClicks;
}
