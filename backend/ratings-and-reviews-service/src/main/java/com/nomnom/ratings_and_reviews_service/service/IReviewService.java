package com.nomnom.ratings_and_reviews_service.service;

import com.nomnom.ratings_and_reviews_service.dto.ReviewDTO;
import com.nomnom.ratings_and_reviews_service.model.Review;

import java.util.List;
import java.util.Optional;

public interface IReviewService {
    Review addReview(ReviewDTO reviewDTO); // Create
    Optional<Review> getReviewById(String id); // Read (by ID)
    Review updateReview(String id, ReviewDTO reviewDTO); // Update
    void deleteReview(String id); // Delete
    List<Review> getReviewsByCustomerId(String customerId);

}