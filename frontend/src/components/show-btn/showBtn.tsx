import { Button } from '@sk-web-gui/react';
import NextLink from 'next/link';

type ShowBtnProps = {
  userId: string;
  ariaLabel: string;
  type: 'delegated' | 'manager';
};

const ShowBtn: React.FC<ShowBtnProps> = ({ userId, ariaLabel, type }) => {
  const baseUrl = type === 'delegated' ? '/show-delegated-checklist/' : '/show-checklist/';
  return (
    <NextLink legacyBehavior={true} href={`${baseUrl}${userId}`} passHref>
      <Button className="mt-4" color="primary" size="lg" variant="solid" aria-label={ariaLabel}>
        Visa
      </Button>
    </NextLink>
  );
};

export default ShowBtn;
