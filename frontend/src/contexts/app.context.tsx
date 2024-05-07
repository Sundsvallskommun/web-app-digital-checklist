import { User } from 'src/interfaces/user';
import { Onboarding } from 'src/interfaces/onboarding';
import { createContext, useContext, useState } from 'react';
import { emptyUser } from '@services/user-service';
import { emptyOnboarding } from '@services/onboarding-service';

export interface AppContextInterface {
  user: User;
  setUser: (user: User) => void;

  onboarding: Onboarding;
  setOnboarding: (onboarding: Onboarding) => void;

  isCookieConsentOpen: boolean;
  setIsCookieConsentOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextInterface>(null);

export function AppWrapper({ children }) {
  const [user, setUser] = useState<User>(emptyUser);
  const [onboarding, setOnboarding] = useState<Onboarding>(emptyOnboarding);
  const [isCookieConsentOpen, setIsCookieConsentOpen] = useState(true);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser: (user: User) => setUser(user),

        onboarding,
        setOnboarding: (onboarding: Onboarding) => setOnboarding(onboarding),

        isCookieConsentOpen,
        setIsCookieConsentOpen: (isOpen: boolean) => setIsCookieConsentOpen(isOpen),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext) as AppContextInterface;
}
