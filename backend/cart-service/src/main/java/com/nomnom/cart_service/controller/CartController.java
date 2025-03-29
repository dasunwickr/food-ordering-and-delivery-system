package com.nomnom.cart_service.controller;

import com.nomnom.cart_service.dto.CartDTO;
import com.nomnom.cart_service.response.CartResponse;
import com.nomnom.cart_service.service.ICart;
import com.nomnom.cart_service.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final ICart cartService;

    @GetMapping("/{customerId}/{restaurantId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable String customerId, @PathVariable String restaurantId) {
        return ResponseEntity.ok(mapToCartDTO(cartService.getCart(customerId, restaurantId)));
    }

    @PostMapping("/add/{customerId}/{restaurantId}")
    public ResponseEntity<CartDTO> addItemToCart(
            @PathVariable String customerId,
            @PathVariable String restaurantId,
            @RequestBody CartService.CartItemRequest request) {
        return ResponseEntity.ok(mapToCartDTO(cartService.addItemToCart(customerId, restaurantId, request)));
    }

    @PutMapping("/update/{customerId}/{restaurantId}/{itemId}")
    public ResponseEntity<CartDTO> updateCartItemQuantity(
            @PathVariable String customerId,
            @PathVariable String restaurantId,
            @PathVariable String itemId,
            @RequestParam int newQuantity) {
        return ResponseEntity.ok(mapToCartDTO(cartService.updateCartItemQuantity(customerId, restaurantId, itemId, newQuantity)));
    }

    @DeleteMapping("/remove/{customerId}/{restaurantId}/{itemId}")
    public ResponseEntity<Void> removeItemFromCart(
            @PathVariable String customerId,
            @PathVariable String restaurantId,
            @PathVariable String itemId) {
        cartService.removeItemFromCart(customerId, restaurantId, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear/{customerId}/{restaurantId}")
    public ResponseEntity<Void> clearCart(@PathVariable String customerId, @PathVariable String restaurantId) {
        cartService.clearCart(customerId, restaurantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<CartDTO>> getAllCarts(){
        List<CartDTO> cartDTOs = cartService.getAllCarts().stream()
                .map(this::mapToCartDTO)
                .toList();
        return ResponseEntity.ok(cartDTOs);
    }


    private CartDTO mapToCartDTO(com.nomnom.cart_service.model.Cart cart) {
        return new CartDTO(
                cart.getId(),
                cart.getCustomerId(),
                cart.getRestaurantId(),
                cart.getItems().stream().map(item -> new CartDTO.CartItemDTO(
                        item.getItemId(),
                        item.getItemName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getTotalPrice()
                )).toList(),
                cart.getTotalPrice(),
                cart.getCreatedAt(),
                cart.getUpdatedAt()
        );
    }
}