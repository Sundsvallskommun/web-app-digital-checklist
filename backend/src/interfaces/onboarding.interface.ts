export interface Onboarding {
  id: number;
  name: string;
  guid: string;
  email: string;
  password: string;
  userId: string;
}

export interface TaskChange {
  completed: boolean;
  notRelevant: boolean;
  text: string;
  responseText?: string;
}

export interface CustomTask {
  heading: string;
  text: string;
  checklistId: number;
  phaseId: number;
  responseText?: string;
}

export interface TasksBulkUpdate {
  uuid: string;
  completed: boolean;
  notRelevant: boolean;
  responseText?: string;
}

export interface TaskDelete {
  uuid: string;
}

export interface DelegateChecklist {
  emailToDelegateTo: string;
  checklistId: number;
}
