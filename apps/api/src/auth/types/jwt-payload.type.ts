import { Provider } from '../../database/schema/user.schema';

export type JwtUser = {
  id: string;           // User ID
  name: string;         // Optional user name
  email: string;         // User email
  pfp?: string | null;   // Profile picture URL
}; 