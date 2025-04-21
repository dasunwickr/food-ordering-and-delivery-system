package com.nomnom.user_service.service;

import com.nomnom.user_service.model.VehicleType;
import com.nomnom.user_service.repository.VehicleTypeRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class VehicleTypeService {
    private final VehicleTypeRepository vehicleTypeRepository;

    public VehicleType createVehicleType(VehicleType type) {
        return vehicleTypeRepository.save(type);
    }

    public List<VehicleType> getAllVehicleTypes() {
        return vehicleTypeRepository.findAll();
    }

    public Optional<VehicleType> getVehicleTypeById(String id) {
        return vehicleTypeRepository.findById(id);
    }
}
