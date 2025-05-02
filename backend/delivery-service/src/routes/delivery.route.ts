// src/routes/deliveryRoutes.ts
import { Router } from 'express';
import * as deliveryController from '../controllers/delivery.controller';
import axios from 'axios';

const router = Router();

/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Create a new delivery for an order
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/', deliveryController.createDelivery);

// Get delivery by order ID
router.get('/order/:orderId', deliveryController.getDeliveryByOrderId);

// Get all deliveries
router.get('/', deliveryController.getAllDeliveries);

// Get deliveries by customer ID
router.get('/customer/:customerId', deliveryController.getDeliveriesByCustomerId);

// Get deliveries by driver ID
router.get('/driver/:driverId', deliveryController.getDeliveriesByDriverId);

// Get deliveries by restaurant ID
router.get('/restaurant/:restaurantId', deliveryController.getDeliveriesByRestaurantId);

// Get delivery by ID with order details
router.get('/:id/with-order', deliveryController.getDeliveryWithOrderDetails);

// Get delivery by ID
router.get('/:id', deliveryController.getDeliveryById);

// Update delivery
router.put('/:id', deliveryController.updateDelivery);

// Delete delivery
router.delete('/:id', deliveryController.deleteDelivery);

// Health check
router.get('/health', deliveryController.healthCheck);

// Proxy route for OSRM routing service
router.get('/route/:coordinates', async (req, res) => {
  try {
    const { coordinates } = req.params;
    const baseUrl = process.env.OSRM_SERVICE_URL || 'https://routing.openstreetmap.de';
    const response = await axios.get(
      `${baseUrl}/routed-car/route/v1/driving/${coordinates}`,
      { 
        params: req.query,
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'food-delivery-system/1.0'
        }
      }
    );
    res.json(response.data);
  } catch (error: any) {
    console.error('OSRM proxy error:', error);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Routing request timed out' });
    } else if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Failed to fetch route' });
    }
  }
});

export default router;