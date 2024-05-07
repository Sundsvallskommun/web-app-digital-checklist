import { ApiResponse, apiService } from './api-service';
import {
  BulkUpdateTasksResponse,
  CustomTask,
  Onboarding,
  TaskChange,
  TaskDelete,
  TaskUpdate,
  TasksBulkUpdate,
  DelegateChecklist,
} from '@interfaces/onboarding';

export const emptyOnboarding = {
  name: '',
};
export const emptyTaskChange: TaskChange = {
  completed: false,
  notRelevant: false,
  responseText: '',
};
export const emptyCustomTask: CustomTask = {
  heading: '',
  checklistId: null,
  phaseId: null,
};
export const emptyTasksBulkUpdate: TaskUpdate = {
  uuid: '',
  completed: false,
  notRelevant: false,
  responseText: '',
};
export const emptyTasksDelete: TaskDelete = {
  uuid: '',
};

export const emptyDelegateChecklist: DelegateChecklist = {
  emailToDelegateTo: '',
  checklistId: null,
};

export const getOnboarding: () => Promise<{ data: Onboarding; error?: Error; status?: number }> = () => {
  return apiService
    .get<ApiResponse<Onboarding>>(`onboarding`)
    .then((res) => ({ data: res.data.data, status: res.status }))
    .catch((e) => {
      return {
        data: {
          ...emptyOnboarding,
          asManagerChecklists: [],
          asEmployeeChecklist: { employee: null, phases: {} },
        },
        error: e.response?.status
          ? new Error(`Fel ${e.response.status}: ${e.response.statusText}`)
          : new Error('Ett okänt fel inträffade'),
        status: e.response?.status,
      };
    });
};

export const editTask = (uuid: string, taskChange: TaskChange): Promise<{ data: TaskChange; error?: Error }> => {
  return apiService
    .put<ApiResponse<TaskChange>>(`onboarding/tasks/update/${uuid}`, taskChange)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({ data: emptyTaskChange, error: e.response?.status ?? 'UNKNOWN ERROR' }));
};

export const createCustomTask = (customTask: CustomTask): Promise<{ data: CustomTask; error?: Error }> => {
  return apiService
    .post<ApiResponse<CustomTask>>(`onboarding/tasks`, customTask)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({ data: emptyCustomTask, error: e.response?.status ?? 'UNKNOWN ERROR' }));
};

export const bulkUpdateTasks = (tasks: { data: TasksBulkUpdate }): Promise<BulkUpdateTasksResponse> => {
  return apiService
    .post<ApiResponse<TaskUpdate[]>>('/onboarding/tasks/bulkUpdate', tasks)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({ data: emptyTasksBulkUpdate, error: e.response?.status ?? 'UNKNOWN ERROR' }));
};

export const deleteTask = (uuid: string): Promise<{ data: TaskDelete; error?: Error }> => {
  return apiService
    .delete<ApiResponse<TaskDelete>>(`onboarding/tasks/${uuid}`)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({ data: emptyTasksDelete, error: e.response?.status ?? 'UNKNOWN ERROR' }));
};

// Delegation
export const delegateChecklist = (
  delegateChecklistDto: DelegateChecklist
): Promise<{ data: DelegateChecklist; error?: Error }> => {
  return apiService
    .post<ApiResponse<DelegateChecklist>>(`onboarding/delegatedChecklists`, delegateChecklistDto)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({
      data: emptyDelegateChecklist,
      error: e.response?.status ?? 'UNKNOWN ERROR',
    }));
};

export const getDelegateChecklist: () => Promise<{
  data: Onboarding;
  error?: Error;
  status?: number;
}> = () => {
  return apiService
    .get<ApiResponse<Onboarding>>(`onboarding/delegatedChecklists`)
    .then((res) => ({ data: res.data.data, status: res.status }))
    .catch((e) => ({
      data: {
        ...emptyOnboarding,
        delegatedChecklists: [],
      },
      error: e.response?.status
        ? new Error(`Fel ${e.response.status}: ${e.response.statusText}`)
        : new Error('Ett okänt fel inträffade'),
    }));
};
