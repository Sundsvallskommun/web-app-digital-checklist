export interface User {
  personid: string;
  userId: string;
  name: string;
  givenName: string;
  surname: string;
  isManager: boolean;
  id?: number;
  companyId: number;
}
