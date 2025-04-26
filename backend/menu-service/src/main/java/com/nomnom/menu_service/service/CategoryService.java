package com.nomnom.menu_service.service;

import com.nomnom.menu_service.model.Category;
import com.nomnom.menu_service.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Add a new category if it doesn't already exist.
     */
    public Category addCategory(String categoryName) {
        return categoryRepository.findByName(categoryName)
                .orElseGet(() -> categoryRepository.save(new Category(categoryName)));
    }

    /**
     * Get all categories.
     */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Check if a category exists by name.
     */
    public boolean categoryExists(String categoryName) {
        return categoryRepository.findByName(categoryName).isPresent();
    }
}