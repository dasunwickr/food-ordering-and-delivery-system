/**
 * Client information service for tracking and identifying users
 */
import { getClientIdentifier } from '@/utils/ip-address';
import api from '@/lib/axios';

/**
 * Response interface for client information
 */
export interface ClientInfo {
  ip: string;
  userAgent: string;
  headers: {
    forwardedFor: string | null;
    realIp: string | null;
  };
  timestamp: string;
}

/**
 * Service for retrieving and managing client information
 */
export const clientService = {
  /**
   * Get client information including IP address, user agent, and headers
   * This is useful for authentication and tracking purposes
   */
  getClientInfo: async (): Promise<ClientInfo> => {
    // Get client identifier from utility
    const clientId = await getClientIdentifier();
    
    // Default headers
    const headers = {
      forwardedFor: null,
      realIp: null
    };
    
    // Create client info object
    const clientInfo: ClientInfo = {
      ip: clientId.ip,
      userAgent: clientId.userAgent,
      headers,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Optional: Try to get more accurate client info from server
      const response = await api.get('/api/client-info');
      if (response.data) {
        // Merge client data from server with local data
        return {
          ...clientInfo,
          ...response.data,
          timestamp: new Date().toISOString() // Always use current timestamp
        };
      }
    } catch (error) {
      console.log('Could not fetch client info from server, using local data');
    }
    
    return clientInfo;
  },
  
  /**
   * Track a client event for analytics
   */
  trackEvent: async (eventType: string, eventData: Record<string, any> = {}): Promise<void> => {
    try {
      const clientInfo = await clientService.getClientInfo();
      
      // Send event data to analytics endpoint
      await api.post('/api/analytics/events', {
        eventType,
        eventData,
        clientInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track event:', error);
      // Fail silently - analytics should not interrupt user experience
    }
  }
};

export default clientService;