import { useContext, useEffect, useState } from 'react';
import { useAppContext } from '@contexts/app.context';
import { useRouter } from 'next/router';
import { ChecklistContext } from '@contexts/checklist-context';

export default function Index() {
  const [statusMessage, setStatusMessage] = useState('Omdirigerar...');

  const router = useRouter();
  const { user } = useAppContext();
  const { delegatedChecklists, apiStatusDelegated } = useContext(ChecklistContext);

  const { isManager } = user;

  useEffect(() => {
    const routerPush = isManager || delegatedChecklists.length > 0 ? 'manager-overview' : 'show-checklist';
    if (apiStatusDelegated) {
      router.push(routerPush).then(() => setStatusMessage('Omdirigering slutförd.'));
    }
  }, [isManager, router, delegatedChecklists, apiStatusDelegated]);
  return (
    <div aria-live="polite" className="sr-only">
      {statusMessage}
    </div>
  );
}
