/**
 * IP address utility functions for client-side usage
 * 
 * This file contains utility functions for working with IP addresses
 * in the browser context. It helps with determining client IP addresses
 * for authentication and tracking purposes.
 */

/**
 * Get the client's IP address using a free public API
 * Note: This is a fallback approach for client-side only as the most accurate way
 * to get a user's IP address is from the server
 */
export async function getClientIpAddress(): Promise<string> {
  try {
    // Try a few public APIs to get the client IP address
    // Option 1: ipify
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      if (data && data.ip) {
        return data.ip;
      }
    } catch (error) {
      console.log('Failed to get IP from ipify, trying alternative service');
    }
    
    // Option 2: ip-api (fallback)
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      if (data && data.ip) {
        return data.ip;
      }
    } catch (error) {
      console.log('Failed to get IP from alternative service');
    }
    
    // Fallback to localhost if unable to determine IP
    return '127.0.0.1';
  } catch (error) {
    console.error('Error determining client IP address:', error);
    return '127.0.0.1';
  }
}

/**
 * Get a client identifier that combines IP address with other browser fingerprinting
 * attributes for better client identification
 */
export async function getClientIdentifier(): Promise<{ip: string, userAgent: string}> {
  const ip = await getClientIpAddress();
  return {
    ip,
    userAgent: navigator.userAgent
  };
}