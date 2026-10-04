package com.URLShortner.app.repository;

import com.URLShortner.app.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {

    Optional<Url> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);
    Optional<Url> findByIdAndUserId(Long id, Long userId);
    List<Url> findAllByUserIdOrderByCreateAtDesc(Long userId);
}
