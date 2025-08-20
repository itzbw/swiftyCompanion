export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

export interface UserSkill {
  id: number;
  name: string;
  level: number;
}

export interface UserProject {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  exam: boolean;
  git_id: number;
  repository_url: string;
  repository_uuid: string;
  final_mark: number | null;
  occurrence: number;
  retriable_at: string | null;
  'validated?': boolean | null;
  current_team_id: number;
  project: {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    exam: boolean;
    repository_url: string;
    repository_uuid: string;
    estimate_time: string;
    experience: number;
    difficulty: number;
  };
  cursus_ids: number[];
  marked_at: string | null;
  marked: boolean;
  retriable: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface User42 {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  usual_full_name: string;
  usual_first_name: string | null;
  url: string;
  phone: string;
  displayname: string;
  kind: string;
  image: {
    link: string;
    versions: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
  'staff?': boolean;
  correction_point: number;
  pool_month: string;
  pool_year: string;
  location: string | null;
  wallet: number;
  anonymize_date: string;
  data_erasure_date: string;
  created_at: string;
  updated_at: string;
  alumnized_at: string | null;
  'alumni?': boolean;
  'active?': boolean;
  // Add these fields that ProfileScreen expects:
  cursus_users?: Array<{
    level: number;
    skills: Array<{
      id: number;
      name: string;
      level: number;
    }>;
  }>;
  projects_users?: Array<{
    id: number;
    final_mark: number | null;
    'validated?': boolean | null;
    marked_at: string | null;
    project: {
      name: string;
    };
  }>;
}
