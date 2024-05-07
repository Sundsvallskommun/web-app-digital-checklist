import { useEffect, useRef } from 'react';

import { Button } from '@sk-web-gui/react';
import EmptyLayout from '../layouts/empty-layout/empty-layout.component';
import { useRouter } from 'next/router';

export default function Start() {
  const router = useRouter();

  const initalFocus = useRef<HTMLButtonElement>(null);
  const setInitalFocus = () => {
    setTimeout(() => {
      initalFocus.current && initalFocus.current.focus();
    });
  };

  const onLogin = () => {
    // NOTE: send user to login with SSO
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/login`);
  };

  useEffect(() => {
    setInitalFocus();
  }, []);

  return (
    <>
      <EmptyLayout title="Checklista - Logga In">
        <section>
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-5xl w-full flex flex-col bg-white p-20 shadow-lg text-left">
              <div className="mb-14">
                <h1 className="mb-10 text-xl">Checklista</h1>
                <p className="my-0">Checklista för digital onboarding.</p>
              </div>

              <Button
                variant="solid"
                color="primary"
                onClick={() => onLogin()}
                ref={initalFocus}
                data-cy="loginButton"
                aria-label="Logga in i applikationen"
              >
                Logga in
              </Button>
            </div>
          </div>
        </section>
      </EmptyLayout>
    </>
  );
}
