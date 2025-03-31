// src/services/deliveryService.ts

import Delivery, { IDelivery } from "../models/delivery.model";

/**
 * Create a new delivery
 */
export const createDelivery = async (
  deliveryData: Partial<IDelivery>,
): Promise<IDelivery> => {
  try {
    const newDelivery = new Delivery(deliveryData);
    return await newDelivery.save();
  } catch (error) {
    throw new Error(`Error creating delivery: ${error}`);
  }
};

/**
 * Get all deliveries
 */
export const getAllDeliveries = async (): Promise<IDelivery[]> => {
  try {
    return await Delivery.find();
  } catch (error) {
    throw new Error(`Error fetching deliveries: ${error}`);
  }
};

/**
 * Get a delivery by ID
 */
export const getDeliveryById = async (
  deliveryId: string,
): Promise<IDelivery | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }
    return delivery;
  } catch (error) {
    throw new Error(`Error fetching delivery: ${error}`);
  }
};

/**
 * Update a delivery
 */
export const updateDelivery = async (
  deliveryId: string,
  updateData: Partial<IDelivery>,
): Promise<IDelivery | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      updateData,
      { new: true },
    );
    return updatedDelivery;
  } catch (error) {
    throw new Error(`Error updating delivery: ${error}`);
  }
};

/**
 * Delete a delivery
 */
export const deleteDelivery = async (
  deliveryId: string,
): Promise<IDelivery | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    return await Delivery.findByIdAndDelete(deliveryId);
  } catch (error) {
    throw new Error(`Error deleting delivery: ${error}`);
  }
};
