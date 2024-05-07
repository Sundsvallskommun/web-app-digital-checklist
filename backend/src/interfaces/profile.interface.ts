import { Profile as SamlProfile } from 'passport-saml';

export interface Profile extends SamlProfile {
  username: string;
  givenName: string;
  surname: string;
  attributes: { [key: string]: any };
  uid: string;
  companyId: number;
}
