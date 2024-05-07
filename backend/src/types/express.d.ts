import { User } from '@interfaces/users.interface';
import { Onboarding } from '@interfaces/onboarding.interface';

declare module 'express-serve-static-core' {
  export interface Request {
    user?: any | User;
    onboarding?: any | Onboarding;
  }
}
