package com.nomnom.ratings_and_reviews_service.service;

import com.nomnom.ratings_and_reviews_service.dto.ReviewDTO;
import com.nomnom.ratings_and_reviews_service.model.Review;

import java.util.List;

public interface IReviewService {
    Review addReview(ReviewDTO reviewDTO);
    List<Review> getReviewsByTarget(Long targetId, Review.TargetType targetType);
}