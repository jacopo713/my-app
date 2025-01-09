// types.d.ts
import { User } from 'firebase/auth';

declare global {
  interface UserAuth {
    user: User | null;
    loading: boolean;
  }

  interface AuthStatusProps {
    className?: string;
  }
}

export {};
