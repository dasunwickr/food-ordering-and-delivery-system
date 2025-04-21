package com.nomnom.user_service.controller;

import com.nomnom.user_service.model.VehicleType;
import com.nomnom.user_service.service.VehicleTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VehicleTypeController {
    private final VehicleTypeService vehicleTypeService;

    @PostMapping
    public ResponseEntity<VehicleType> createVehicleType(@RequestBody VehicleType type) {
        return ResponseEntity.status(201).body(vehicleTypeService.createVehicleType(type));
    }

    @GetMapping
    public ResponseEntity<List<VehicleType>> getAllVehicleTypes() {
        return ResponseEntity.ok(vehicleTypeService.getAllVehicleTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleType> getVehicleTypeById(@PathVariable String id) {
        return vehicleTypeService.getVehicleTypeById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
