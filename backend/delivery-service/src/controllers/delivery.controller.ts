import { Request, Response } from "express";
import * as deliveryService from "../services/delivery.service";

/**
 * Create a new delivery
 */
export const createDelivery = async (req: Request, res: Response) => {
  try {
    const delivery = await deliveryService.createDelivery(req.body);
    res.status(201).json(delivery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all deliveries
 */
export const getAllDeliveries = async (_req: Request, res: Response) => {
  try {
    const deliveries = await deliveryService.getAllDeliveries();
    res.status(200).json(deliveries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a delivery by ID
 */
export const getDeliveryById = async (req: Request, res: Response) => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    res.status(200).json(delivery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a delivery
 */
export const updateDelivery = async (req: Request, res: Response) => {
  try {
    const updatedDelivery = await deliveryService.updateDelivery(
      req.params.id,
      req.body,
    );
    if (!updatedDelivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    res.status(200).json(updatedDelivery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a delivery
 */
export const deleteDelivery = async (req: Request, res: Response) => {
  try {
    const deletedDelivery = await deliveryService.deleteDelivery(req.params.id);
    if (!deletedDelivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    res.status(200).json({ message: "Delivery deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
