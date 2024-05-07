import { useEffect, useState } from 'react';
import { Spinner } from '@sk-web-gui/react';
import { getMe } from '@services/user-service';
import { useAppContext } from '@contexts/app.context';
import { useRouter } from 'next/router';

export const LoginGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useAppContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getMe()
      .then((me) => {
        setUser(me);
      })
      .catch((error) => {
        if (error === 'Missing SAML profile') {
          router.push(
            {
              pathname: '/login',
              query: {
                failMessage: 'Kunde inte hitta användaren.',
              },
            },
            '/login'
          );
        } else if (error === 'Failed to fetch user from Citizen API') {
          router.push(
            {
              pathname: '/login',
              query: {
                failMessage: 'Kunde inte logga in.',
              },
            },
            '/login'
          );
        } else if (router.pathname !== '/login') {
          router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/login`);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || (!user.name && router.pathname !== '/login')) {
    return (
      <main>
        <div className="w-screen h-screen flex place-items-center place-content-center">
          <Spinner size="lg" aria-label="Laddar information" />
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default LoginGuard;
