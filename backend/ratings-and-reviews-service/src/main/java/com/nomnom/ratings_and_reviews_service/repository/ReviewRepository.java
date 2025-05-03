package com.nomnom.ratings_and_reviews_service.repository;

import com.nomnom.ratings_and_reviews_service.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    Optional<Review> findByTargetId(String targetId);
    List<Review> findAllByCustomerId(String customerId);

}