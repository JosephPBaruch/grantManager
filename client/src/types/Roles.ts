export interface Role {
  id: string;
  grant_id: string;
  user_id: string;
  role_type: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}
