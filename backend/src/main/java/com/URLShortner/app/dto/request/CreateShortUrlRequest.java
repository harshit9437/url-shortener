package com.URLShortner.app.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor


public class CreateShortUrlRequest {
    @NotBlank(message = "Original URL cannot be blank")
    @Pattern(
            regexp = "^(https?://).+",
            message = "URL must start with http:// or https://"
    )
    private String originalUrl;
    @Future(message = "Expiration time must be in future ")
    private LocalDateTime expireAt;
    @Pattern(
            regexp = "[a-zA-Z0-9_-]{3,30}$",
            message = "Custom alias must be 3-30 characters and contain only letters, numbers, '-' or '_'"
    )
    private String customAlias;

}
