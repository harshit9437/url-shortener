package com.URLShortner.app.service;

import com.URLShortner.app.dto.response.AnalyticsResponse;
import com.URLShortner.app.dto.request.CreateShortUrlRequest;
import com.URLShortner.app.dto.request.UrlAnalyticsResponse;
import com.URLShortner.app.dto.response.ClickTimelineResponse;
import com.URLShortner.app.dto.response.ShortUrlResponse;
import com.URLShortner.app.entity.Click;
import com.URLShortner.app.entity.Url;
import com.URLShortner.app.entity.UrlStatus;
import com.URLShortner.app.entity.User;
import com.URLShortner.app.exception.ShortCodeAlreadyExistsException;
import com.URLShortner.app.exception.UrlGoneException;
import com.URLShortner.app.exception.UrlNotFoundException;
import com.URLShortner.app.repository.ClickRepository;
import com.URLShortner.app.repository.UserRepository;
import com.URLShortner.app.util.ShortCodeGenerator;
import com.URLShortner.app.repository.UrlRepository;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UrlService {
    private final UrlRepository urlRepository;
    private final ShortCodeGenerator shortCodeGenerator;
    private final ModelMapper modelMapper;
    private final ClickRepository clickRepository;
    private final UserRepository userRepository;

    public UrlService(
            UrlRepository urlRepository,
            ShortCodeGenerator shortCodeGenerator,
            ModelMapper modelMapper,
            ClickRepository clickRepository, UserRepository userRepository) {
        this.urlRepository = urlRepository;
        this.shortCodeGenerator = shortCodeGenerator;
        this.modelMapper=modelMapper;
        this.clickRepository=clickRepository;
        this.userRepository = userRepository;
    }
    public ShortUrlResponse createShortUrl(CreateShortUrlRequest request) {

        String shortCode;

        if (request.getCustomAlias() != null) {

            if (urlRepository.existsByShortCode(request.getCustomAlias())) {
                throw new ShortCodeAlreadyExistsException(
                        "Custom alias already exists: " + request.getCustomAlias()
                );
            }

            shortCode = request.getCustomAlias();

        } else {

            shortCode = shortCodeGenerator.generate();

            while (urlRepository.existsByShortCode(shortCode)) {
                shortCode = shortCodeGenerator.generate();
            }
        }

        User currentUser = getCurrentUser();

        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode(shortCode)
                .expireAt(request.getExpireAt())
                .user(currentUser)
                .build();

        Url savedUrl = urlRepository.save(url);

        ShortUrlResponse response =
                modelMapper.map(savedUrl, ShortUrlResponse.class);

        response.setStatus(getUrlStatus(savedUrl));

        response.setShortUrl(
                "http://localhost:8080/" + savedUrl.getShortCode()
        );

        return response;
    }
    @Transactional
    public String getOriginalUrl(String shortCode) {

        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() ->
                        new UrlNotFoundException(
                                "URL not found for short code: " + shortCode
                        )
                );
        if (!url.getActive()){
            throw  new UrlGoneException(
                    "Url is no longer active : "+shortCode
            );
        }
        if (url.getExpireAt()!=null && !url.getExpireAt().isAfter(LocalDateTime.now())){
            throw new UrlGoneException(
                    "Url has expired "+shortCode
            );
        }

        Click click=Click.builder().url(url).build();
        clickRepository.save(click);
        url.setClickCount(url.getClickCount() + 1);
        urlRepository.save(url);


        return url.getOriginalUrl();
    }
    public ShortUrlResponse getUrlById(long id){
        User currentUser = getCurrentUser();
        Url url = urlRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() ->
                        new UrlNotFoundException(
                                "URL not found with id: " + id
                        )
                );
        ShortUrlResponse response=modelMapper.map(url,ShortUrlResponse.class);
        response.setStatus(getUrlStatus(url));
        response.setShortUrl(
                "http://localhost:8080/" + url.getShortCode()
        );
        return response;
    }
    public UrlAnalyticsResponse getAnalytics(Long id) {

        User currentUser = getCurrentUser();

        Url url = urlRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() ->
                        new UrlNotFoundException(
                                "URL not found with id: " + id
                        )
                );

        Optional<Click> lastClick =
                clickRepository.findTopByUrlIdOrderByClickAtDesc(id);

        UrlAnalyticsResponse response =
                new UrlAnalyticsResponse();

        response.setUrlId(url.getId());
        response.setShortCode(url.getShortCode());
        response.setOriginalUrl(url.getOriginalUrl());
        response.setTotalClicks(url.getClickCount());
        response.setCreatedAt(url.getCreateAt());

        lastClick.ifPresent(click ->
                response.setLastClickedAt(click.getClickAt())
        );

        return response;
    }

    public AnalyticsResponse getClicksByRange(
            Long urlId,
            LocalDateTime from,
            LocalDateTime to) {

        User currentUser = getCurrentUser();

        Url url = urlRepository
                .findByIdAndUserId(urlId, currentUser.getId())
                .orElseThrow(() ->
                        new UrlNotFoundException(
                                "URL not found with id: " + urlId
                        )
                );

        Long totalClicks =
                clickRepository.countByUrlIdAndClickAtBetween(
                        urlId,
                        from,
                        to
                );

        return new AnalyticsResponse(
                url.getId(),
                url.getShortCode(),
                url.getOriginalUrl(),
                from,
                to,
                totalClicks
        );
    }

    public void disableUrl(Long id) {

        User currentUser = getCurrentUser();

        Url url = urlRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() ->
                        new UrlNotFoundException(
                                "URL not found with id: " + id
                        )
                );

        url.setActive(false);

        urlRepository.save(url);
    }

    private UrlStatus getUrlStatus(Url url) {

        if (!url.getActive()) {
            return UrlStatus.DISABLED;
        }

        if (url.getExpireAt() != null &&
                !url.getExpireAt().isAfter(LocalDateTime.now())) {
            return UrlStatus.EXPIRED;
        }

        return UrlStatus.ACTIVE;
    }
    private User getCurrentUser() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Authenticated user not found"
                        )
                );
    }


    public List<ClickTimelineResponse> getClickTimeline(
            Long urlId,
            LocalDateTime from,
            LocalDateTime to) {

        User currentUser = getCurrentUser();

        Url url = urlRepository
                .findByIdAndUserId(urlId, currentUser.getId())
                .orElseThrow(() ->
                        new UrlNotFoundException(
                                "URL not found with id: " + urlId
                        )
                );

        List<Object[]> results =
                clickRepository.getClickTimeline(
                        url.getId(),
                        from,
                        to
                );

        List<ClickTimelineResponse> timeline = new ArrayList<>();

        for (Object[] row : results) {

            LocalDate date = (LocalDate) row[0];

            Long clicks = ((Number) row[1]).longValue();

            timeline.add(
                    new ClickTimelineResponse(
                            date,
                            clicks
                    )
            );
        }

        return timeline;
    }
    public List<ShortUrlResponse>  getMyUrls(){
        User currentUser=getCurrentUser();
        List<Url> urls=urlRepository.findAllByUserIdOrderByCreateAtDesc(currentUser.getId());
        return urls.stream()
                .map(url -> {
                    ShortUrlResponse response =
                            modelMapper.map(url, ShortUrlResponse.class);

                    response.setStatus(getUrlStatus(url));

                    response.setShortUrl(
                            "http://localhost:8080/" + url.getShortCode()
                    );

                    return response;
                })
                .toList();
    }
}
