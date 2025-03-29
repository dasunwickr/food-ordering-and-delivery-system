package com.nomnom.ratings_and_reviews_service.controller;

import com.nomnom.ratings_and_reviews_service.dto.ReviewDTO;
import com.nomnom.ratings_and_reviews_service.model.Review;
import com.nomnom.ratings_and_reviews_service.service.IReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private IReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(reviewService.addReview(reviewDTO));
    }

    @GetMapping("/target/{targetId}/{targetType}")
    public ResponseEntity<List<Review>> getReviewsByTarget(
            @PathVariable Long targetId,
            @PathVariable Review.TargetType targetType) {
        return ResponseEntity.ok(reviewService.getReviewsByTarget(targetId, targetType));
    }
}