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
  private isAuthenticating: boolean = false;

  async authenticate(): Promise<void> {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth error response:', errorText);
        throw new Error(
          `Authentication failed: ${response.status} - ${errorText}`
        );
      }

      const tokenData: AuthToken = await response.json();
      this.accessToken = tokenData.access_token;
      // Subtract 300 seconds (5 minutes) as safety buffer
      this.tokenExpiresAt = Date.now() + (tokenData.expires_in - 300) * 1000;

      console.log('Authentication successful');
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
    return Date.now() >= this.tokenExpiresAt;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // checks if the token is expired before making any API call
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || this.isTokenExpired()) {
      await this.authenticate();
    }
  }

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<Response> {
    await this.ensureValidToken();

    for (let attempt = 0; attempt <= retries; attempt++) {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      // Handle 429 (Rate Limited) with exponential backoff
      if (response.status === 429) {
        if (attempt < retries) {
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(
            `Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`
          );
          await this.delay(waitTime);
          continue;
        } else {
          throw new Error(
            'Rate limit exceeded - please wait before searching again'
          );
        }
      }

      // Handle 401 (Unauthorized)
      if (response.status === 401) {
        console.log('Got 401, refreshing token and retrying...');
        this.accessToken = null;
        this.tokenExpiresAt = null;
        await this.authenticate();

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

    throw new Error('Max retries exceeded');
  }

  async getUser(login: string): Promise<User42> {
    try {
      console.log('Fetching user data for:', login);
      console.time(`getUserData-${login}`);

      // First, get the main user data (this must succeed)
      const userResponse = await this.makeAuthenticatedRequest(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}`
      );

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`Failed to fetch user: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      console.log('✅ User data received for:', userData.login);

      await this.delay(200);

      // Then fetch cursus and projects data in parallel (these can fail gracefully)
      const [cursusResult, projectsResult] = await Promise.allSettled([
        this.makeAuthenticatedRequest(
          `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`
        ),
        this.makeAuthenticatedRequest(
          `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/projects_users`
        ),
      ]);

      // Handle cursus data with better error checking
      let cursusData: any[] = [];
      if (cursusResult.status === 'fulfilled') {
        try {
          if (cursusResult.value.ok) {
            cursusData = await cursusResult.value.json();
            console.log('✅ Cursus data loaded:', cursusData.length, 'entries');

            // Debug first cursus entry
            if (cursusData.length > 0) {
              console.log(
                '🔍 First cursus skills:',
                cursusData[0].skills?.length || 0
              );
            }
          } else {
            console.warn(
              '❌ Cursus request failed:',
              cursusResult.value.status
            );
          }
        } catch (error) {
          console.warn('❌ Error parsing cursus data:', error);
        }
      } else {
        console.warn('❌ Cursus request rejected:', cursusResult.reason);
      }

      // Handle projects data with better error checking
      let projectsData: any[] = [];
      if (projectsResult.status === 'fulfilled') {
        try {
          if (projectsResult.value.ok) {
            projectsData = await projectsResult.value.json();
            console.log(
              '✅ Projects data loaded:',
              projectsData.length,
              'entries'
            );
          } else {
            console.warn(
              '❌ Projects request failed:',
              projectsResult.value.status
            );
          }
        } catch (error) {
          console.warn('❌ Error parsing projects data:', error);
        }
      } else {
        console.warn('❌ Projects request rejected:', projectsResult.reason);
      }

      console.timeEnd(`getUserData-${login}`);

      const finalUserData = {
        ...userData,
        cursus_users: cursusData,
        projects_users: projectsData,
      };

      console.log('🔍 FINAL DATA SUMMARY:');
      console.log('- Cursus entries:', finalUserData.cursus_users?.length || 0);
      console.log(
        '- Projects entries:',
        finalUserData.projects_users?.length || 0
      );
      if (finalUserData.cursus_users?.[0]) {
        console.log(
          '- Skills in first cursus:',
          finalUserData.cursus_users[0].skills?.length || 0
        );
      }

      return finalUserData;
    } catch (error) {
      console.error('❌ Error in getUser:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user data');
    }
  }
  // async getUserCursus(login: string): Promise<any[]> {
  //   try {
  //     const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`;
  //     const response = await this.makeAuthenticatedRequest(url);

  //     if (!response.ok) {
  //       console.warn('Failed to fetch cursus data:', response.status);
  //       return [];
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.warn('Failed to fetch cursus data:', error);
  //     return [];
  //   }
  // }

  async getUserCursus(login: string): Promise<any[]> {
    try {
      // Try adding query parameters to ensure skills are included
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users?filter[primary]=true`;
      const response = await this.makeAuthenticatedRequest(url);

      if (!response.ok) {
        console.warn('Failed to fetch cursus data:', response.status);
        return [];
      }

      const cursusData = await response.json();
      console.log(
        '🔍 RAW CURSUS WITH SKILLS:',
        JSON.stringify(cursusData, null, 2)
      );
      return cursusData;
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
        console.warn('Failed to fetch projects:', response.status);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch projects:', error);
      return [];
    }
  }

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

  async refreshToken(): Promise<void> {
    this.accessToken = null;
    this.tokenExpiresAt = null;
    await this.authenticate();
  }
}

export const apiClient = new ApiClient();
