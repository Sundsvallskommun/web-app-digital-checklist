import { Popover } from '@headlessui/react';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '@contexts/app.context';
// import { ICase } from '@interfaces/case';
// import { getChangedCases } from '@services/notifications-service';
// import { getFeedbackSettings } from '@services/settings-service';
// import { getUserMeta } from '@services/user-service';
import NotificationsModal from '../notifications-modal/notifications-modal.component';
import { INotification } from '@interfaces/notifaction.interface';

export const NotificationsAlert: React.FC = () => {
  const popoverButtonRef = useRef(null);
  // const { cases, user, userMeta, setUserMeta, setFeedbackSettings, changedCases, setChangedCases } = useAppContext();

  const closeModal = () => {
    popoverButtonRef.current.click();
  };

  const notificationData: INotification[] = [
    {
      label: 'notis',
    },
  ];

  // useEffect(() => {
  // getUserMeta().then(setUserMeta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  // const changed = getChangedCases(user, userMeta, cases);
  // setChangedCases(changed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [userMeta, cases, user]);

  return (
    <Popover className="lg:relative">
      <div className="lg:relative mr-sm sm:mr-md">
        <Popover.Button
          onClick={() => {}}
          ref={popoverButtonRef}
          // className='scale-150'
          aria-label={`Det finns ${notificationData.length > 0 ? notificationData.length : 'inga'} nya händelser`}
        >
          <div className="relative cursor-pointer text-xl  lg:text-2xl">
            <NotificationsActiveOutlinedIcon className="material-icon" />
            {notificationData && notificationData.length > 0 ? (
              <div className="absolute text-white text-xs font-bold flex items-center justify-center w-[18px] h-[18px] bg-red-700 rounded-full -top-2 -right-5 border-2 border-white box-content">
                <span>{notificationData.length > 99 ? '99+' : notificationData.length}</span>
              </div>
            ) : (
              ''
            )}
          </div>
        </Popover.Button>
      </div>

      <Popover.Panel className="absolute z-10 right-0 left-0 lg:left-auto">
        <NotificationsModal isOpen={true} closeModal={closeModal} notificationAlerts={notificationData} />
      </Popover.Panel>
    </Popover>
  );
};
