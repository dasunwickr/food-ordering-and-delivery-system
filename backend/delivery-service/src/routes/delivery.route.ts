// src/routes/deliveryRoutes.ts
import express from "express";
import * as deliveryController from "../controllers/delivery.controller";

const router = express.Router();

// Create a new delivery
router.post("/", deliveryController.createDelivery);

// Get all deliveries
router.get("/", deliveryController.getAllDeliveries);

// Get a specific delivery by ID
router.get("/:id", deliveryController.getDeliveryById);

// Update a delivery by ID
router.put("/:id", deliveryController.updateDelivery);

// Delete a delivery by ID
router.delete("/:id", deliveryController.deleteDelivery);

export default router;
