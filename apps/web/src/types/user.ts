export type User = {
  email: string | null;
  id: string;
  name: string;
  pwd: string | null;
  provider: 'google' | 'github';
  providerid: string;
  pfp: string | null;
};
