package com.URLShortner.app.controller;

import com.URLShortner.app.dto.response.AnalyticsResponse;
import com.URLShortner.app.dto.request.CreateShortUrlRequest;
import com.URLShortner.app.dto.request.UrlAnalyticsResponse;
import com.URLShortner.app.dto.response.ClickTimelineResponse;
import com.URLShortner.app.dto.response.ShortUrlResponse;
import com.URLShortner.app.entity.Url;
import com.URLShortner.app.service.UrlService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/urls")
@Validated
public class UrlController {
    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }
    @PostMapping
    public ResponseEntity<ShortUrlResponse> createShortUrl(
           @Valid @RequestBody CreateShortUrlRequest request){
        ShortUrlResponse response = urlService.createShortUrl(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ShortUrlResponse> getUrlById(@PathVariable @Positive long id){
        return ResponseEntity.ok(urlService.getUrlById(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> disableUrl(@PathVariable @Positive long id){
        urlService.disableUrl(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}/analytics")
    public ResponseEntity<UrlAnalyticsResponse> getUrlAnalytics(
            @PathVariable @Positive  Long id){
        return ResponseEntity.ok(urlService.getAnalytics(id));

    }
    @GetMapping("/{id}/analytics/range")
    public ResponseEntity<AnalyticsResponse> getClicksInRange(
            @PathVariable @Positive  Long id,
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to) {

        return ResponseEntity.ok(
                urlService.getClicksByRange(id, from, to)
        );
    }
    @GetMapping("/{id}/analytics/timeline")
    public ResponseEntity<List<ClickTimelineResponse>> getClickTimeline(
            @PathVariable @Positive  Long id,
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to) {

        return ResponseEntity.ok(
                urlService.getClickTimeline(id, from, to)
        );
    }
    @GetMapping()
    public ResponseEntity<List<ShortUrlResponse>> getMyUrls(){
        return ResponseEntity.ok(urlService.getMyUrls());
    }



}
