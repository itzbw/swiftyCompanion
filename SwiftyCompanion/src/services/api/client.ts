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

  //   async authenticate(): Promise<void> {
  //     try {
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

  //       if (!response.ok) {
  //         throw new Error(`Authentication failed: ${response.status}`);
  //       }

  //       const tokenData: AuthToken = await response.json();
  //       this.accessToken = tokenData.access_token;
  //     } catch (error) {
  //       throw new Error(`Failed to authenticate: ${error}`);
  //     }
  //   }

  async authenticate(): Promise<void> {
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
      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(`Failed to authenticate: ${error}`);
    }
  }

  async getUser(login: string): Promise<User42> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.status === 404) {
        throw new Error('User not found');
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const userData = await response.json();

      console.log('User location from API:', userData.location);
      console.log('Full user data:', JSON.stringify(userData, null, 2));

      const cursusData = await this.getUserCursus(login);
      const projectsData = await this.getUserProjects(login);

      return {
        ...userData,
        cursus_users: cursusData,
        projects_users: projectsData,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user data');
    }
  }

  async getUserCursus(login: string): Promise<any[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

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
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/cursus_users`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

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
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS}/${login}/projects_users`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch projects:', error);
      return [];
    }
  }
}

export const apiClient = new ApiClient();
