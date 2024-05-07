import { INotification } from '@interfaces/notifaction.interface';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SettingsOutlineIcon from '@mui/icons-material/SettingsOutlined';
import { Button } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import NextLink from 'next/link';
import { useState } from 'react';
// import { useAppContext } from '../../contexts/app.context';
// import { ICase } from '../../interfaces/case';
// import { statusCodes } from '../../interfaces/status-codes';
// import { UserMetaResponse } from '../../services/user-service';
import NotificationComponent from '../notification-component/notification.component';

const NotificationsModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  notificationAlerts: INotification[];
}> = ({ isOpen = false, closeModal, notificationAlerts = [] }) => {
  // const { setUserMeta } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const clearNotifications: () => void = () => {
    // TODO fetch new actual user meta from api when available
    // (newly fetched user meta will/should contain cirka lastLoginTime = now)
    // const newMeta: UserMetaResponse = {
    //   lastLoginTime: dayjs().toISOString(),
    // };
    // setUserMeta(newMeta);
    closeModal();
  };

  const content = (
    <div className="bg-gray-100 lg:bg-white rounded-md lg:border border-gray-400 shadow-lg p-md pb-xl lg:pb-md flex flex-col">
      <div className="flex justify-between">
        <h4>
          <NotificationsActiveOutlinedIcon className="scale-125 mb-2" fontSize="medium" /> Notifikationer
        </h4>
        <button className="inline-block lg:hidden" onClick={clearNotifications}>
          Rensa alla
        </button>
      </div>
      {notificationAlerts.map((e, idx) => {
        // const alertType =
        //   e.status.code === statusCodes.Approved
        //     ? 'success'
        //     : e.status.code === statusCodes.Rejected
        //     ? 'error'
        //     : e.status.code === statusCodes.Ongoing
        //     ? 'info'
        //     : 'warning';
        return <NotificationComponent clickHandler={closeModal} item={e} key={`notification-${idx}`} />;
      })}
      <div className="hidden lg:flex w-full justify-between mt-md">
        <Button
          type="submit"
          variant="solid"
          size="lg"
          color="primary"
          leftIcon={<DeleteOutlineIcon fontSize="large" className="mr-sm" />}
          onClick={clearNotifications}
          loading={isLoading}
          loadingText={'Sparar'}
        >
          Rensa alla
        </Button>
        <NextLink href="/installningar" passHref={true}>
          <Button
            type="button"
            variant="solid"
            size="lg"
            leftIcon={<SettingsOutlineIcon fontSize="large" className="mr-sm" />}
            onClick={() => {
              setError(false);
              closeModal();
            }}
          >
            Inställningar för händelser
          </Button>
        </NextLink>
      </div>
    </div>
  );

  return (
    isOpen && (
      <>
        <div className="block lg:hidden w-screen absolute top-9 min-h-80 z-10">{content}</div>
        <div className="hidden lg:block absolute top-10 -right-14 min-w-[50rem] w-min min-h-80">{content}</div>
      </>
    )
  );
};

export default NotificationsModal;
