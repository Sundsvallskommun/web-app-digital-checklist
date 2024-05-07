import { useAppContext } from '@contexts/app.context';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import { Badge, Button, Divider, Profile, ZebraTable, ZebraTableColumn, ZebraTableHeader } from '@sk-web-gui/react';
import { apiURL } from '@utils/api-url';
import { getManagerPhaseStatus } from '@utils/get-manager-phase-status-utils';
import Image from 'next/image';
import NextLink from 'next/link';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import DelegateBtn from '../components/delegate-btn/delegateBtn';
import ShowBtn from '../components/show-btn/showBtn';
import { ChecklistContext } from '../contexts/checklist-context';
import { logoUrls } from '@utils/logoUrls';

export const ManagerOverview: React.FunctionComponent = () => {
  const [logo, setLogo] = useState(null);

  const { asManagerChecklists, delegatedChecklists, employeeCheckList, apiStatus } = useContext(ChecklistContext);
  const { user } = useAppContext();

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
      // Sundsvall Hamn
      case 16:
        setLogo(logoUrls.sundsvallsHamn);
        break;
      // Ingen loga ska visas upp förutom för dessa företag.
      default:
        setLogo(null);
        break;
    }
  }, [user.companyId]);

  const headers: ZebraTableHeader[] = [
    {
      element: <span className="font-bold text-lg">Anställd</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span className="font-bold text-lg">Användarnamn</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span className="font-bold text-lg">Progress chef</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span className="font-bold text-lg">Progress anställd</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
  ];

  const delegatedHeaders: ZebraTableHeader[] = [
    {
      element: <span className="font-bold text-lg">Anställd</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span className="font-bold text-lg">Användarnamn</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span className="font-bold text-lg">Progress ansvarig</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
    {
      element: <span className="font-bold text-lg">Progress anställd</span>,
      isShown: true,
      isColumnSortable: false,
      screenReaderOnly: false,
    },
  ];

  const rows: ZebraTableColumn[][] =
    asManagerChecklists.map((newHires) => {
      const phases = Object.values(newHires.phases);
      const { managerPhase, isInPhase } = getManagerPhaseStatus(phases);

      const employeePhaseCount = phases.filter((phase) => phase.stakeholder === 'EMPLOYEE').length;

      const completedEmployeePhases = phases
        .filter((phase) => phase.stakeholder === 'EMPLOYEE')
        .reduce((count, phase) => {
          const allTasksDoneOrNotRelevant = phase.tasks.every((task) => task.completed || task.notRelevant);
          return allTasksDoneOrNotRelevant ? count + 1 : count;
        }, 0);

      return [
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Anställd</span>
              {newHires.employee.personId ? (
                <Profile
                  image={`${apiURL(`/employee/${newHires.employee.personId}/personimage?width=${224}`)}`}
                  imageAlt={`${newHires.employee.firstName} ${newHires.employee.lastName} profilbild`}
                  title={newHires.employee.firstName + ' ' + newHires.employee.lastName}
                  subTitle={newHires.employee.title}
                />
              ) : (
                <p aria-live="polite">Loading...</p>
              )}
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Användarnamn</span>

              <p>{newHires.employee.userName}</p>
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Progress chef</span>
              <div className="flex items-center h-5 mt-4">
                <Badge
                  className={isInPhase === 'I fas' ? 'bg-green-700' : 'bg-red-700'}
                  size="md"
                  aria-label={`Chef progress: ${isInPhase}`}
                />
                <h3 className="ml-4 font-bold text-lg">
                  {isInPhase} gentemot {newHires.employee.firstName}
                </h3>
              </div>

              <p className="text-left text-lg" aria-label={`Chef progress:`}>
                {managerPhase ? managerPhase.name : 'N/A'}
              </p>
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Progress anställd</span>
              <p className="text-center mr-24 text-lg" aria-label={`Medarbetare progress:`}>
                {completedEmployeePhases}/{employeePhaseCount}
              </p>
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <ShowBtn
                userId={newHires.employee.userName}
                ariaLabel={`Visa nyanställningschecklista för ${newHires.employee.firstName} ${newHires.employee.lastName}`}
                type="manager"
              />
            </Fragment>
          ),
          isShown: true,
        },
        user.isManager
          ? {
              element: (
                <Fragment>
                  <DelegateBtn
                    checklistId={newHires.id}
                    ariaLabel={`Delegera ${newHires.employee.firstName} ${newHires.employee.lastName} checklista`}
                  />
                </Fragment>
              ),
              isShown: true,
            }
          : {
              element: <></>,
              isShown: false, // Hide the column when user.isManager is false.
            },
        ,
      ];
    }) || [];

  const delegatedRows: ZebraTableColumn[][] =
    delegatedChecklists?.map((delegatedEmployee) => {
      const phases = Object.values(delegatedEmployee.phases);
      const { managerPhase, isInPhase } = getManagerPhaseStatus(phases);

      const employeePhaseCount = phases.filter((phase) => phase.stakeholder === 'EMPLOYEE').length;

      const completedEmployeePhases = phases
        .filter((phase) => phase.stakeholder === 'EMPLOYEE')
        .reduce((count, phase) => {
          const allTasksDoneOrNotRelevant = phase.tasks.every((task) => task.completed || task.notRelevant);
          return allTasksDoneOrNotRelevant ? count + 1 : count;
        }, 0);

      return [
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Anställd</span>
              {delegatedEmployee.employee.personId ? (
                <Profile
                  image={`${apiURL(`/employee/${delegatedEmployee.employee.personId}/personimage?width=${224}`)}`}
                  imageAlt={`${delegatedEmployee.employee.firstName} ${delegatedEmployee.employee.lastName} profilbild`}
                  title={delegatedEmployee.employee.firstName + ' ' + delegatedEmployee.employee.lastName}
                  subTitle={delegatedEmployee.employee.title}
                />
              ) : (
                <p aria-live="polite">Loading...</p>
              )}
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Användarnamn</span>

              <p>{delegatedEmployee.employee.userName}</p>
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Progress ansvarig</span>
              <div className="flex items-center h-5 mt-4">
                <Badge
                  className={isInPhase === 'I fas' ? 'bg-green-700' : 'bg-red-700'}
                  size="md"
                  aria-label={`Ansvarig progress: ${isInPhase}`}
                />
                <h3 className="ml-4 font-bold text-lg">
                  {isInPhase} gentemot {delegatedEmployee.employee.firstName}
                </h3>
              </div>

              <p className="text-left text-lg" aria-label={`Ansvarig progress:`}>
                {managerPhase ? managerPhase.name : 'N/A'}
              </p>
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <span className="inline lg:hidden">Progress anställd</span>
              <p className="text-center mr-24 text-lg" aria-label={`Medarbetare progress:`}>
                {completedEmployeePhases}/{employeePhaseCount}
              </p>
            </Fragment>
          ),
          isShown: true,
        },
        {
          element: (
            <Fragment>
              <ShowBtn
                userId={delegatedEmployee.employee.userName}
                ariaLabel={`Visa nyanställningschecklista för ${delegatedEmployee.employee.firstName} ${delegatedEmployee.employee.lastName}`}
                type="delegated"
              />
            </Fragment>
          ),
          isShown: true,
        },
      ];
    }) || [];

  //START:/ When SAML details is entered in backend env uncomment this to test
  // useEffect(()=>{
  //   if (!user.name) {
  //     getMe().then((user) => {
  //       setUser(user);
  //     });
  //   }
  // },[user])
  //:END/
  // @refresh reset

  return (
    <DefaultLayout title={`Digital Checklista`}>
      {user.isManager && asManagerChecklists.length === 0 ? (
        <h2 className="mt-4 mb-20 font-medium">Inga nyanställda kunde hittas i din organisation</h2>
      ) : user.isManager && asManagerChecklists.length > 0 ? (
        <>
          <div className="flex  justify-between">
            <h1 className="mt-4 mb-20">Checklistor för nyanställda</h1>
            {logo && <Image src={logo} alt="Company Logotype" className="h-32 w-60" />}
          </div>
        </>
      ) : null}

      {!user.isManager && apiStatus === 404 ? (
        <h2 className="mt-8 font-medium">Ingen checklista kunde hittas för dig.</h2>
      ) : !user.isManager && apiStatus === 204 ? (
        <h2 className="mt-8 font-medium">Tidigare checklista har gallrats då tidsperioden har passerats.</h2>
      ) : null}

      {user.isManager && employeeCheckList.length > 0 ? (
        <NextLink legacyBehavior={true} href={'/show-checklist'} passHref>
          <Button
            color="primary"
            variant="solid"
            className="mb-20"
            disabled={employeeCheckList.length === 0}
            aria-label="Visa min checklista"
          >
            Visa min checklista
          </Button>
        </NextLink>
      ) : null}

      {asManagerChecklists.length > 0 ? (
        <>
          <h2>
            Nyanställda<span> ({asManagerChecklists.length})</span>
          </h2>
          <Divider />
          <ZebraTable
            summary="En tabell som visar introduktionsprocessen för chefer och medarbetare."
            tableSortable={true}
            headers={headers}
            rows={rows}
          />

          <Divider className="mt-32" />
        </>
      ) : null}

      {delegatedChecklists && delegatedChecklists.length > 0 && (
        <div className="mt-32">
          <h2>
            Delegerade Checklistor<span> ({delegatedChecklists.length})</span>
          </h2>
          <Divider />

          <ZebraTable
            summary="En tabell som visar introduktionsprocessen för personal som fått checklista/or delegerad till sig och medarbetare."
            tableSortable={true}
            headers={delegatedHeaders}
            rows={delegatedRows}
          />
        </div>
      )}
    </DefaultLayout>
  );
};

export default ManagerOverview;
