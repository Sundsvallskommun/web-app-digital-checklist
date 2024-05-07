import { Button } from '@sk-web-gui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { delegateChecklist } from '@services/onboarding-service';

type DelegateBtnProps = {
  checklistId: number;
  ariaLabel: string;
};

const DelegateBtn: React.FC<DelegateBtnProps> = ({ checklistId, ariaLabel }) => {
  const [showModal, setShowModal] = useState(false);
  const [emailToDelegateTo, setEmailToDelegateTo] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleOnclick = (checklistId: number) => {
    setShowModal(true);
  };

  const handleSend = async () => {
    delegateChecklist({ emailToDelegateTo, checklistId })
      .then((res) => {
        if (!res.error) {
          setEmailToDelegateTo('');
          setMessage('Checklistan är delegerad!');
          setMessageType('success');
          setShowModal(false);
        } else {
          console.log('Error delegating checklist', res.error);
          if ((res.error as any) === 500) {
            setMessage(`Checklistan med id: ${checklistId} är redan delegerad till: ${emailToDelegateTo}`);
            setMessageType('error');
          } else {
            setMessage(`Error: ${res.error}`);
            setMessageType('error');
          }
        }
      })
      .catch((e) => {
        console.log('Catch: Error delegating checklist', e);
      });
  };

  return (
    <NextLink legacyBehavior={true} href={`/show-checklist/${checklistId}`} passHref>
      <>
        <Button
          className="mt-[1.4rem]"
          color="primary"
          size="lg"
          variant="solid"
          aria-label={ariaLabel}
          onClick={(e) => handleOnclick(checklistId)}
        >
          Delegera checklista
        </Button>

        {showModal && (
          <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-lg px-8 py-6 w-1/2">
              <Button
                variant="solid"
                color="secondary"
                onClick={() => {
                  setShowModal(false);
                  setMessage('');
                  setEmailToDelegateTo('');
                }}
              >
                Close
              </Button>
              <input
                type="email"
                value={emailToDelegateTo}
                onChange={(e) => setEmailToDelegateTo(e.target.value)}
                className="mt-4 w-full px-4 py-6 border rounded  text-lg"
                placeholder="Email till den du vill delegera checklista till"
              />
              {message ? (
                <p className={`mt-4 text-center ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {message}
                </p>
              ) : (
                ''
              )}

              <div className="flex justify-between">
                <p className="mr-8 mt-8">{ariaLabel}</p>
                <Button
                  variant="solid"
                  color="primary"
                  className="mt-4"
                  onClick={handleSend}
                  disabled={!emailToDelegateTo}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    </NextLink>
  );
};

export default DelegateBtn;
