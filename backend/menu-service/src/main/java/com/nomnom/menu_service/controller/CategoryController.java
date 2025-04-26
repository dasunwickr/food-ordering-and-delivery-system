package com.nomnom.menu_service.controller;

import com.nomnom.menu_service.model.Category;
import com.nomnom.menu_service.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * Add a new category using the Category model directly.
     */
    @PostMapping(consumes = "application/json")
    public ResponseEntity<Category> addCategory(@RequestBody Category category) {
        // Call the service layer to add the category
        Category savedCategory = categoryService.addCategory(category.getName());
        return ResponseEntity.ok(savedCategory);
    }

    /**
     * Get all categories.
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return categories.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(categories);
    }

    /**
     * Check if a category exists.
     */
    @GetMapping("/exists/{categoryName}")
    public ResponseEntity<Boolean> categoryExists(@PathVariable String categoryName) {
        boolean exists = categoryService.categoryExists(categoryName);
        return ResponseEntity.ok(exists);
    }
}