package com.URLShortner.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Optional;

@Getter
@Setter
@Table(name = "click")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Click {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "url_id", nullable = false)
    private Url url;
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime clickAt;
}
