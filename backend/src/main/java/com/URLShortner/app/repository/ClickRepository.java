package com.URLShortner.app.repository;

import com.URLShortner.app.entity.Click;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClickRepository extends JpaRepository<Click, Long> {

    Optional<Click> findTopByUrlIdOrderByClickAtDesc(Long urlId);

    long countByUrlIdAndClickAtBetween(
            Long urlId,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query(value = """
            SELECT
                DATE(click_at) AS click_date,
                COUNT(*) AS click_count
            FROM click
            WHERE url_id = :urlId
              AND click_at BETWEEN :from AND :to
            GROUP BY DATE(click_at)
            ORDER BY DATE(click_at)
            """, nativeQuery = true)
    List<Object[]> getClickTimeline(
            @Param("urlId") Long urlId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}