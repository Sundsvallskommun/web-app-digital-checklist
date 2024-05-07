export interface Employee {
  email: string;
  firstName: string;
  isManager: boolean;
  lastName: string;
  personId: string;
  title: string;
  userName: string;
}

export interface TaskUpdate {
  completed: boolean;
  notRelevant: boolean;
  responseText?: string;
  uuid: string;
}
export interface TaskDelete {
  uuid: string;
}

export interface TaskChange {
  completed?: boolean;
  notRelevant?: boolean;
  responseText?: string;
}

export interface CustomTask {
  checklistId: number;
  heading: string;
  phaseId: number;
  text?: string;
  responseText?: string;
}

export interface Task {
  completed: boolean;
  createdAt: string;
  employee: Employee;
  endsAt: string;
  heading: string;
  manager: Employee;
  notRelevant: boolean;
  phases: { [key: string]: Phase };
  startsAt: string;
  taskType: 'DEFAULT' | 'CUSTOM' | 'UNIT';
  text: string;
  title: string;
  updatedAt: string;
  uuid: string;
  yesOrNo?: boolean;
  freeText?: boolean;
  responseText?: string;
}

export interface Phase {
  dueDate: string;
  id: number;
  name: string;
  stakeholder: string;
  tasks: Task[];
  bodyText: string;
}

export interface Onboarding {
  name: string;
  asManagerChecklists?: AsManagerChecklist[];
  asEmployeeChecklist?: {
    employee: Employee;
    phases: { [key: string]: Phase };
  };
  delegatedChecklists?: DelegatedChecklists[];
}

export interface OnboardingData {
  asEmployeeChecklist: {
    employee: Employee;
    phases: { [key: string]: Phase };
  };
  asManagerChecklists: AsManagerChecklist[];
}

export interface AsManagerChecklist {
  employee: Employee;
  firstName: string;
  id: number;
  lastName: string;
  manager: Employee;
  phases: Phase[];
  completedEmployeePhases?: number;
  employeePhaseCount?: number;
  startsAt?: string;
}

export interface BulkUpdateTasksResponse {
  data: TaskUpdate[] | TaskUpdate;
  error?: Error;
}

export type TasksBulkUpdate = TaskUpdate[];

export interface DelegateChecklist {
  emailToDelegateTo: string;
  checklistId: number;
}

export interface DelegatedChecklists {
  createdAt: string;
  employee: Employee;
  endsAt: string;
  id: number;
  locked: boolean;
  manager: Employee;
  phases: { [key: number]: Phase };
  startsAt: string;
  updatedAt: string;
}
