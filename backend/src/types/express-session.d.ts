import { User } from '@/interfaces/users.interface';
import { Onboarding } from '@/interfaces/onboarding.interface';
import { Session } from 'express-session';

interface Engagement {
  organizationName: string;
  organizationNumber: string;
  organizationId: string;
}

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    onboarding?: Onboarding;
    representing?: Engagement;
    passport?: any;
    representingChoices?: Engagement[];
  }
}
