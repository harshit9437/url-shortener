package com.URLShortner.app.dto.response;

import com.URLShortner.app.entity.UrlStatus;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShortUrlResponse {
    private Long id;

    private String originalUrl;

    private String shortCode;

    private String shortUrl;

    private Long clickCount;

    private UrlStatus status;
}
