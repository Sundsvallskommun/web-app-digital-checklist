import React, { createContext, useEffect, useState } from 'react';

import { getOnboarding, getDelegateChecklist } from '@services/onboarding-service';

import { getManagerPhaseStatus } from '@utils/get-manager-phase-status-utils';

import { Employee, Task, Phase, AsManagerChecklist, OnboardingData, DelegatedChecklists } from '@interfaces/onboarding';
import { useAppContext } from '@contexts/app.context';

interface ChecklistContextType {
  asManagerChecklists: AsManagerChecklist[];
  setAsManagerChecklists: React.Dispatch<React.SetStateAction<AsManagerChecklist[]>>;

  delegatedChecklists: DelegatedChecklists[];
  setDelegatedChecklists: React.Dispatch<React.SetStateAction<DelegatedChecklists[]>>;

  employeeCheckList: Task[];
  setEmployeeCheckList: React.Dispatch<React.SetStateAction<Task[]>>;

  employee: Employee;
  setEmployee: React.Dispatch<React.SetStateAction<Employee>>;

  employeePhases: Phase[];
  setEmployeePhases: React.Dispatch<React.SetStateAction<Phase[]>>;

  managerPhases: Phase[];
  setManagerPhases: React.Dispatch<React.SetStateAction<Phase[]>>;

  fetchOnboardingData: () => Promise<void>;

  employeeId: number;
  setEmployeeId: React.Dispatch<React.SetStateAction<number>>;

  apiStatus: number | string;
  setApiStatus: React.Dispatch<React.SetStateAction<number | string>>;

  apiStatusDelegated: number | string;
  setApiStatusDelegated: React.Dispatch<React.SetStateAction<number | string>>;
}

const ChecklistContext = createContext<ChecklistContextType>({
  asManagerChecklists: [],
  setAsManagerChecklists: () => {},

  delegatedChecklists: [],
  setDelegatedChecklists: () => {},

  employeeCheckList: [],
  setEmployeeCheckList: () => {},

  employee: {
    firstName: '',
    lastName: '',
    isManager: false,
    email: '',
    personId: '',
    userName: '',
    title: '',
  },
  setEmployee: () => {},

  employeePhases: [],
  setEmployeePhases: () => {},

  managerPhases: [],
  setManagerPhases: () => {},

  fetchOnboardingData: () => Promise.resolve(),

  employeeId: 0,
  setEmployeeId: () => {},

  apiStatus: 0,
  setApiStatus: () => {},

  apiStatusDelegated: 0,
  setApiStatusDelegated: () => {},
});

function ChecklistProvider(props: { children: React.ReactNode }) {
  const [asManagerChecklists, setAsManagerChecklists] = useState<AsManagerChecklist[]>([]);
  const [delegatedChecklists, setDelegatedChecklists] = useState<DelegatedChecklists[]>([]);
  const [employeeCheckList, setEmployeeCheckList] = useState<Task[]>([]);
  const { user } = useAppContext();

  const [employee, setEmployee] = useState<Employee>({
    firstName: '',
    lastName: '',
    isManager: false,
    email: '',
    personId: '',
    userName: '',
    title: '',
  });

  const [employeePhases, setEmployeePhases] = useState<Phase[]>([]);
  const [managerPhases, setManagerPhases] = useState<Phase[]>([]);

  const [employeeId, setEmployeeId] = useState<number>();

  const [apiStatus, setApiStatus] = useState<number | string>();
  const [apiStatusDelegated, setApiStatusDelegated] = useState<number | string>();

  async function fetchOnboardingData() {
    try {
      const result = await getOnboarding();

      setApiStatus(result?.status ?? (result?.error as any)?.response?.status ?? 'UNKNOWN ERROR');

      setAsManagerChecklists(result?.data?.asManagerChecklists ?? []);

      const employeeTasks: Task[] = result?.data?.asEmployeeChecklist?.phases
        ? Object.values(result?.data?.asEmployeeChecklist?.phases).flatMap((phase: Phase) => phase.tasks)
        : [];

      setEmployeeCheckList(employeeTasks);

      setEmployeePhases(
        result?.data?.asEmployeeChecklist?.phases ? Object.values(result?.data?.asEmployeeChecklist?.phases) : []
      );

      const defaultEmployee: Employee = {
        firstName: '',
        lastName: '',
        isManager: false,
        email: '',
        personId: '',
        userName: '',
        title: '',
      };
      const employeeData = result?.data?.asEmployeeChecklist?.employee;
      const updatedEmployee = { ...defaultEmployee, ...employeeData };
      setEmployee(updatedEmployee);

      if (result?.data?.asManagerChecklists) {
        const updatedManagerChecklists = result.data.asManagerChecklists.map((newHire: AsManagerChecklist) => {
          const phasesArray: Phase[] = Object.values(newHire.phases);
          const { isInPhase } = getManagerPhaseStatus(phasesArray);
          return { ...newHire, isInPhase };
        });

        setAsManagerChecklists(updatedManagerChecklists);
      }
      const delegatedChecklist = await getDelegateChecklist();
      const delegatedChecklistStatus = (result?.error as any)?.response?.status ?? 'UNKNOWN ERROR';
      setApiStatusDelegated(delegatedChecklistStatus);
      setDelegatedChecklists(delegatedChecklist?.data?.delegatedChecklists ?? []);
    } catch (error) {
      console.error('Uncaught Error:', error);
      if (error?.response?.status === 404) {
        setApiStatus(404);
      } else if (error?.response?.status === 204) {
        setApiStatus(204);
      } else {
        setApiStatus('UNKNOWN ERROR');
      }
    }
  }

  useEffect(() => {
    if (user.userId) {
      // only call if user.id is available
      fetchOnboardingData();
    }
  }, [user.userId]); // add user.id to dependency array

  return (
    <ChecklistContext.Provider
      value={{
        asManagerChecklists,
        setAsManagerChecklists,

        delegatedChecklists,
        setDelegatedChecklists,

        employeeCheckList,
        setEmployeeCheckList,

        employee,
        setEmployee,

        employeePhases,
        setEmployeePhases,

        managerPhases,
        setManagerPhases,

        fetchOnboardingData,

        employeeId,
        setEmployeeId,

        apiStatus,
        setApiStatus,

        apiStatusDelegated,
        setApiStatusDelegated,
      }}
    >
      {props.children}
    </ChecklistContext.Provider>
  );
}

export { ChecklistContext, ChecklistProvider };
