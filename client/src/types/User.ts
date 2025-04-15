export interface User {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  is_active: boolean;
  is_superuser: boolean;
}
