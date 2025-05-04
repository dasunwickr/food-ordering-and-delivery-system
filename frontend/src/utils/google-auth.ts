import axios from 'axios';

/**
 * Interface for Google user profile data
 */
interface GoogleUserProfile {
  email: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub: string;
}

/**
 * Fetches user profile from Google using an access token
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  try {
    // Create a new axios instance without default credentials setting
    const response = await axios.get<GoogleUserProfile>('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      // Explicitly set withCredentials to false to avoid CORS issues
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Google user profile:', error);
    throw error;
  }
}

/**
 * Processes Google authentication data and returns a normalized user object
 */
export async function processGoogleAuth(tokenResponse: any) {
  try {
    // Get user profile information from Google
    const userProfile = await fetchGoogleUserProfile(tokenResponse.access_token);
    
    // Return a normalized user object with Google profile data
    return {
      email: userProfile.email,
      firstName: userProfile.given_name || '',
      lastName: userProfile.family_name || '',
      profilePictureUrl: userProfile.picture || null,
      provider: 'google',
      verified: userProfile.email_verified || false,
      googleId: userProfile.sub,
      accessToken: tokenResponse.access_token,
    };
  } catch (error) {
    console.error('Error processing Google authentication:', error);
    throw error;
  }
}