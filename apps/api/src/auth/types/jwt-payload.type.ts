
export type JwtUser = {
  id: string;           // User ID
  name: string;         // Optional user name
  email: string | null;         // User email
  pfp?: string | null;   // Profile picture URL
}; 