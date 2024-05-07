import { Link, Radio } from '@sk-web-gui/react';
import React, { useContext, useEffect, useMemo, useState, ChangeEvent } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChecklistContext } from '../../contexts/checklist-context';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import NextLink from 'next/link';
import OnboardingPhases from '@components/onboarding-checklist/onboarding/onboarding-phase.component';
import { useAppContext } from '@contexts/app.context';
import { useRouter } from 'next/router';
import { getManagerPhaseStatus } from '@utils/get-manager-phase-status-utils';
import Image from 'next/image';
import { logoUrls } from '@utils/logoUrls';

export const ShowChecklist: React.FC = () => {
  const [logo, setLogo] = useState(null);
  const [selectedChecklistType, setSelectedChecklistType] = useState<'delegated' | 'manager'>();

  const { setManagerPhases, employeePhases, managerPhases, setEmployeeId, delegatedChecklists } =
    useContext(ChecklistContext);

  const { user } = useAppContext();

  const router = useRouter();
  const { userIds } = router.query;

  const userId = userIds && userIds.length ? userIds[0] : null;
  const { isManager } = user;
  const defaultRadioValue = userId !== null ? 'Chef' : 'Medarbetare';
  const [radioValue, setRadioValue] = useState<string>(defaultRadioValue);
  const [isInPhase, setIsInPhase] = useState<string | null>(null);

  const radioBtnHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setRadioValue(e.target.value);
  };

  const delegatedChecklistsMemo = useMemo(() => delegatedChecklists, [delegatedChecklists]);

  useEffect(() => {
    switch (user.companyId) {
      // Servanet och Sundsvall elnät
      case 12:
        setLogo(logoUrls.servanetSundsvallElnät);
        break;
      // Airport Sundsvall - Timrå
      case 3:
        setLogo(logoUrls.airport);
        break;
      // SKIFU Fastigheter i Sundsvall
      case 15:
        setLogo(logoUrls.skifu);
        break;
      // Sundsvall energi
      case 8:
        setLogo(logoUrls.sundsvallEnergi);
        break;
      // MittHem
      case 14:
        setLogo(logoUrls.mittHem);
        break;
      // MittSverige Vatten&Avfall
      case 9:
        setLogo(logoUrls.mittSverige);
        break;
      // Ingen loga ska visas upp förutom för dessa företag.
      default:
        setLogo(null);
        break;
    }

    if (delegatedChecklists?.length > 0 && userId) {
      setSelectedChecklistType('delegated');
      const managerChecklist = delegatedChecklists?.find(
        (employeeChecklist) => userId === employeeChecklist.employee.userName
      );

      const phaseStatus = managerChecklist ? getManagerPhaseStatus(Object.values(managerChecklist.phases)) : null;

      if (managerChecklist.phases && Object.keys(managerChecklist?.phases).length > 0) {
        setManagerPhases(Object.values(managerChecklist.phases));
      }

      if (phaseStatus) {
        setIsInPhase(phaseStatus.isInPhase);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatedChecklistsMemo, user.companyId]);

  useEffect(() => {
    setEmployeeId(delegatedChecklists?.find((checklist) => checklist.employee.userName === userId)?.id ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatedChecklists, userId]);

  return (
    <DefaultLayout title={`Digital Checklista`}>
      {(isManager || delegatedChecklists.length > 0) && (
        <>
          <ArrowBackIcon className="text-[#005595]" titleAccess="Gå tillbaka till översikt" />
          <NextLink legacyBehavior={true} href={'/manager-overview'} passHref>
            <Link aria-label="Gå tillbaka till översikt">Tillbaka till översikt</Link>
          </NextLink>
        </>
      )}

      <>
        <header className="mt-6 flex justify-between">
          <h1>
            {radioValue === 'Chef'
              ? `Checklista ${
                  delegatedChecklists?.find((checklist) => checklist.employee.userName === userId)?.employee?.firstName
                } ${
                  delegatedChecklists?.find((checklist) => checklist.employee.userName === userId)?.employee?.lastName
                }, (${
                  delegatedChecklists?.find((checklist) => checklist.employee.userName === userId)?.employee?.userName
                })`
              : userId === null
                ? `Checklista ${user.givenName} ${user.surname}
              `
                : `Checklista ${
                    delegatedChecklists?.find((checklist) => checklist.employee.userName === userId)?.employee
                      ?.firstName
                  } ${
                    delegatedChecklists?.find((checklist) => checklist.employee.userName === userId)?.employee?.lastName
                  }, (${
                    delegatedChecklists?.find((checklist) => checklist.employee.userName === userId)?.employee?.userName
                  })`}
          </h1>
          {logo && <Image src={logo} alt="Company Logotype" className="h-32 w-60" />}
        </header>
        {userId && (
          <fieldset className="mt-12">
            <div className="flex justify-between">
              <legend className="mb-2 text-2xl font-semibold">Visa Checklista</legend>
              {isManager || (delegatedChecklists.length > 0 && radioValue === 'Chef') ? (
                <>
                  <div
                    className={`text-white h-[45px] w-44 rounded-xl border-[1px] border-slate-500 flex items-center justify-center  ${
                      isInPhase === 'I fas' ? 'bg-green-700' : 'bg-red-700'
                    }`}
                    aria-label={`Nuvarande fas status: ${isInPhase}`}
                    tabIndex={0}
                    role="status"
                  >
                    {isInPhase}
                  </div>
                </>
              ) : null}
            </div>
            {isManager || delegatedChecklists.length > 0 ? (
              <label htmlFor="chef-radio">
                <Radio
                  id="chef-radio"
                  defaultChecked={radioValue === 'Chef'}
                  size="lg"
                  name="employment title"
                  value={'Chef'}
                  className="mr-sm"
                  onChange={radioBtnHandler}
                >
                  Chef
                </Radio>
              </label>
            ) : null}
            <label htmlFor="medarbetare-radio">
              <Radio
                id="medarbetare-radio"
                defaultChecked={radioValue === 'Medarbetare'}
                size="lg"
                name="employment title"
                value={'Medarbetare'}
                className="mx-sm"
                onChange={radioBtnHandler}
              >
                Medarbetare
              </Radio>
            </label>
          </fieldset>
        )}
        <OnboardingPhases
          radioValue={radioValue}
          phases={userId !== null ? managerPhases : employeePhases}
          isManager={userId !== null}
        />
      </>
    </DefaultLayout>
  );
};

export default ShowChecklist;
