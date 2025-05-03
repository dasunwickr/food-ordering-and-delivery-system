// src/routes/deliveryRoutes.ts
import { Router, Request, Response } from 'express';
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

// Get pending orders that need drivers
router.get('/pending-orders', deliveryController.getPendingOrders);

// Assign a driver to an order
router.post('/order/:orderId/assign-driver', deliveryController.assignDriver);

// Accept a delivery by a driver
router.post('/:deliveryId/accept', deliveryController.acceptDelivery);

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
router.get('/route/:coordinates', (req, res) => {
  (async () => {
    try {
      const { coordinates } = req.params;
      
      // Validate coordinates format
      if (!coordinates || !coordinates.includes(';')) {
        return res.status(400).json({ 
          error: 'Invalid coordinates format. Expected "lng1,lat1;lng2,lat2"' 
        });
      }
      
      // Use the standard OSRM API for reliability
      const baseUrl = process.env.OSRM_SERVICE_URL || 'https://router.project-osrm.org';
      
      console.log(`Routing request: ${baseUrl}/route/v1/driving/${coordinates}`);
      
      const response = await axios.get(
        `${baseUrl}/route/v1/driving/${coordinates}`,
        { 
          params: req.query,
          timeout: 15000, // 15 second timeout
          headers: {
            'User-Agent': 'food-delivery-system/1.0'
          }
        }
      );
      
      // Log successful routing
      console.log(`Routing successful: ${coordinates}`);
      res.json(response.data);
    } catch (error: any) {
      console.error('OSRM proxy error:', error);
      
      // Enhanced error handling
      if (error.code === 'ECONNABORTED') {
        res.status(504).json({ error: 'Routing request timed out' });
      } else if (error.response) {
        // Include more detailed error information for debugging
        const status = error.response.status;
        const errorData = error.response.data;
        console.error(`OSRM returned status ${status}:`, errorData);
        
        res.status(status).json({ 
          error: 'Routing calculation failed', 
          details: errorData,
          message: 'Check that your coordinates are valid - OSRM expects format: lng,lat;lng,lat'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to fetch route',
          message: error.message || 'Unknown routing error'
        });
      }
    }
  })();
});

export default router;