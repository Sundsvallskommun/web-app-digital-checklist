import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import validateEnv from '@utils/validateEnv';

import { UserController } from './controllers/user.controller';

import { OnboardingController } from './controllers/onboarding.controller';

import { EmployeeController } from './controllers/employee.controller';

validateEnv();

const app = new App([IndexController, UserController, OnboardingController, EmployeeController]);

app.listen();
