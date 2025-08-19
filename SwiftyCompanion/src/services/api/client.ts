// import { API_CONFIG, ENDPOINTS } from '../../constants/config';
// import {
//   AuthToken,
//   User42,
//   UserSkill,
//   UserProject,
//   ApiError,
// } from '../../types/api';

// class ApiClient {
//   private accessToken: string | null = null; // Store token as instance variable

//   async authenticate(): Promise<void> {
//     try {
//       console.log('Attempting to authenticate with 42 API...');

//       if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET) {
//         throw new Error(
//           'Missing CLIENT_ID or CLIENT_SECRET in environment variables'
//         );
//       }

//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}${ENDPOINTS.OAUTH_TOKEN}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             grant_type: 'client_credentials',
//             client_id: API_CONFIG.CLIENT_ID,
//             client_secret: API_CONFIG.CLIENT_SECRET,
//           }),
//         }
//       );

//       console.log('Auth response status:', response.status);

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Auth error response:', errorText);
//         throw new Error(
//           `Authentication failed: ${response.status} - ${errorText}`
//         );
//       }

//       // Only get a new token when this method is called
//       const tokenData: AuthToken = await response.json();
//       this.accessToken = tokenData.access_token; // Store it for reuse
//       console.log('Authentication successful');
//     } catch (error) {
//       console.error('Authentication error:', error);
//       throw new Error(`Failed to authenticate: ${error}`);
//     }
//   }

//   async getUser(login: string): Promise<User42> {
//     if (!this.accessToken) {
//       await this.authenticate();
//     }

//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.accessToken}`,
//           },
//         }
//       );

//       if (response.status === 404) {
//         throw new Error('User not found');
//       }

//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status}`);
//       }

//       const userData = await response.json();

//       console.log('User location from API:', userData.location);
//       console.log('Full user data:', JSON.stringify(userData, null, 2));

//       const cursusData = await this.getUserCursus(login);
//       const projectsData = await this.getUserProjects(login);

//       return {
//         ...userData,
//         cursus_users: cursusData,
//         projects_users: projectsData,
//       };
//     } catch (error) {
//       if (error instanceof Error) {
//         throw error;
//       }
//       throw new Error('Failed to fetch user data');
//     }
//   }

//   async getUserCursus(login: string): Promise<any[]> {
//     if (!this.accessToken) {
//       await this.authenticate(); // Only authenticate if no token exists
//     }

//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.accessToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         console.warn('Failed to fetch cursus data:', response.status);
//         return [];
//       }

//       return await response.json();
//     } catch (error) {
//       console.warn('Failed to fetch cursus data:', error);
//       return [];
//     }
//   }

//   async getUserSkills(login: string): Promise<UserSkill[]> {
//     if (!this.accessToken) {
//       await this.authenticate();
//     }

//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.accessToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch skills: ${response.status}`);
//       }

//       const cursusData = await response.json();
//       return cursusData[0]?.skills || [];
//     } catch (error) {
//       console.warn('Failed to fetch skills:', error);
//       return [];
//     }
//   }

//   async getUserProjects(login: string): Promise<UserProject[]> {
//     if (!this.accessToken) {
//       await this.authenticate();
//     }

//     try {
//       const response = await fetch(
//         `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/projects_users`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.accessToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch projects: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.warn('Failed to fetch projects:', error);
//       return [];
//     }
//   }
// }

// export const apiClient = new ApiClient();

//Bonus
import { API_CONFIG, ENDPOINTS } from '../../constants/config';
import {
  AuthToken,
  User42,
  UserSkill,
  UserProject,
  ApiError,
} from '../../types/api';

class ApiClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private isAuthenticating: boolean = false; // Prevent multiple simultaneous auth requests

  async authenticate(): Promise<void> {
    // If already authenticating, wait for it to complete
    if (this.isAuthenticating) {
      return new Promise((resolve, reject) => {
        const checkAuth = () => {
          if (!this.isAuthenticating) {
            if (this.accessToken && !this.isTokenExpired()) {
              resolve();
            } else {
              reject(new Error('Authentication failed'));
            }
          } else {
            setTimeout(checkAuth, 100);
          }
        };
        checkAuth();
      });
    }

    this.isAuthenticating = true;

    try {
      console.log('Attempting to authenticate with 42 API...');

      if (!API_CONFIG.CLIENT_ID || !API_CONFIG.CLIENT_SECRET) {
        throw new Error(
          'Missing CLIENT_ID or CLIENT_SECRET in environment variables'
        );
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.OAUTH_TOKEN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: API_CONFIG.CLIENT_ID,
            client_secret: API_CONFIG.CLIENT_SECRET,
          }),
        }
      );

      console.log('Auth response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth error response:', errorText);
        throw new Error(
          `Authentication failed: ${response.status} - ${errorText}`
        );
      }

      const tokenData: AuthToken = await response.json();
      this.accessToken = tokenData.access_token;

      // Calculate when the token expires (subtract 5 minutes for safety)
      this.tokenExpiresAt = Date.now() + (tokenData.expires_in - 300) * 1000;

      console.log(
        'Authentication successful, token expires in:',
        tokenData.expires_in,
        'seconds'
      );
      console.log(
        'Token will be refreshed at:',
        new Date(this.tokenExpiresAt).toISOString()
      );
    } catch (error) {
      console.error('Authentication error:', error);
      this.accessToken = null;
      this.tokenExpiresAt = null;
      throw new Error(`Failed to authenticate: ${error}`);
    } finally {
      this.isAuthenticating = false;
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) {
      return true;
    }
    const now = Date.now();
    const isExpired = now >= this.tokenExpiresAt;

    if (isExpired) {
      console.log('Token has expired, will refresh on next request');
    }

    return isExpired;
  }

  private async ensureValidToken(): Promise<void> {
    // If no token or token is expired, authenticate
    if (!this.accessToken || this.isTokenExpired()) {
      console.log('Token missing or expired, authenticating...');
      await this.authenticate();
    }
  }

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    await this.ensureValidToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    // If we get 401 Unauthorized, the token might have expired
    // Try to refresh once and retry the request
    if (response.status === 401) {
      console.log(
        'Got 401, token might be expired. Refreshing and retrying...'
      );

      // Force re-authentication
      this.accessToken = null;
      this.tokenExpiresAt = null;
      await this.authenticate();

      // Retry the request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    }

    return response;
  }

  async getUser(login: string): Promise<User42> {
    try {
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}`;
      console.log('Fetching user from:', url);

      const response = await this.makeAuthenticatedRequest(url);

      if (response.status === 404) {
        throw new Error('User not found');
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const userData = await response.json();

      console.log('User location from API:', userData.location);
      console.log('User data received for:', userData.login);

      const cursusData = await this.getUserCursus(login);
      const projectsData = await this.getUserProjects(login);

      return {
        ...userData,
        cursus_users: cursusData,
        projects_users: projectsData,
      };
    } catch (error) {
      console.error('Error in getUser:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user data');
    }
  }

  async getUserCursus(login: string): Promise<any[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`;
      const response = await this.makeAuthenticatedRequest(url);

      if (!response.ok) {
        console.warn('Failed to fetch cursus data:', response.status);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch cursus data:', error);
      return [];
    }
  }

  async getUserSkills(login: string): Promise<UserSkill[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`;
      const response = await this.makeAuthenticatedRequest(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.status}`);
      }

      const cursusData = await response.json();
      return cursusData[0]?.skills || [];
    } catch (error) {
      console.warn('Failed to fetch skills:', error);
      return [];
    }
  }

  async getUserProjects(login: string): Promise<UserProject[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/projects_users`;
      const response = await this.makeAuthenticatedRequest(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch projects:', error);
      return [];
    }
  }

  // Optional: Method to manually check token status
  getTokenStatus(): {
    hasToken: boolean;
    isExpired: boolean;
    expiresAt: string | null;
  } {
    return {
      hasToken: !!this.accessToken,
      isExpired: this.isTokenExpired(),
      expiresAt: this.tokenExpiresAt
        ? new Date(this.tokenExpiresAt).toISOString()
        : null,
    };
  }

  // Optional: Method to force token refresh
  async refreshToken(): Promise<void> {
    this.accessToken = null;
    this.tokenExpiresAt = null;
    await this.authenticate();
  }
}

export const apiClient = new ApiClient();
