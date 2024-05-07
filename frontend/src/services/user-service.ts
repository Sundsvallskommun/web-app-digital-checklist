import { ApiResponse, apiService } from './api-service';

import { User } from 'src/interfaces/user';

export const emptyUser: User = {
  personid: '',
  userId: '',
  name: '',
  givenName: '',
  surname: '',
  isManager: false,
  companyId: 0,
};

const handleSetUserResponse: (res: ApiResponse<User>) => User = (res) => ({
  personid: res.data.personid,
  userId: res.data.userId,
  name: res.data.name,
  givenName: res.data.givenName,
  surname: res.data.surname,
  isManager: res.data.isManager,
  companyId: res.data.companyId,
});

export const getMe: () => Promise<User> = () => {
  return apiService.get<ApiResponse<User>>('me').then((res) => handleSetUserResponse(res.data));
};
