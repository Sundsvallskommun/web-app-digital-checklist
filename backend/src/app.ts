import 'reflect-metadata';

import {
  BASE_URL_PREFIX,
  CREDENTIALS,
  LOG_FORMAT,
  NODE_ENV,
  ORIGIN,
  PORT,
  SAML_CALLBACK_URL,
  SAML_ENTRY_SSO,
  SAML_FAILURE_REDIRECT,
  SAML_IDP_PUBLIC_CERT,
  SAML_ISSUER,
  SAML_LOGOUT_CALLBACK_URL,
  SAML_LOGOUT_REDIRECT,
  SAML_PRIVATE_KEY,
  SAML_PUBLIC_KEY,
  SAML_SUCCESS_REDIRECT,
  SECRET_KEY,
  SESSION_MEMORY,
  SWAGGER_ENABLED,
} from '@config';
import { Strategy, VerifiedCallback } from 'passport-saml';
import { existsSync, mkdirSync } from 'fs';
import { getMetadataArgsStorage, useExpressServer } from 'routing-controllers';
import { logger, stream } from '@utils/logger';

import ApiService from '@/services/api.service';
import { HttpException } from './exceptions/HttpException';
// import { PrismaClient } from '@prisma/client';
import { Profile } from './interfaces/profile.interface';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import createFileStore from 'session-file-store';
import createMemoryStore from 'memorystore';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import errorMiddleware from '@middlewares/error.middleware';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { join } from 'path';
import morgan from 'morgan';
import passport from 'passport';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';

const SessionStoreCreate = SESSION_MEMORY ? createMemoryStore(session) : createFileStore(session);
const sessionTTL = 4 * 24 * 60 * 60;
// NOTE: memory uses ms while file uses seconds
const sessionStore = new SessionStoreCreate(SESSION_MEMORY ? { checkPeriod: sessionTTL * 1000 } : { sessionTTL, path: './data/sessions' });

// const prisma = new PrismaClient();
const apiService = new ApiService();

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

const samlStrategy = new Strategy(
  {
    disableRequestedAuthnContext: true,
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    callbackUrl: SAML_CALLBACK_URL,
    entryPoint: SAML_ENTRY_SSO,
    privateKey: SAML_PRIVATE_KEY,
    cert: SAML_IDP_PUBLIC_CERT,
    issuer: SAML_ISSUER,
    wantAssertionsSigned: false,
    logoutCallbackUrl: SAML_LOGOUT_CALLBACK_URL,
    // NOTE: Allow clock skew incase client and server clocks differs a bit.
    acceptedClockSkewMs: 1000,
  },
  async function (profile: Profile, done: VerifiedCallback) {
    if (!profile) {
      return done({
        name: 'SAML_MISSING_PROFILE',
        message: 'Missing SAML profile',
      });
    }
    // uid is AD-account
    const { uid } = profile;

    if (!uid) {
      return done({
        name: 'SAML_MISSING_ATTRIBUTES',
        message: 'Missing profile attributes',
      });
    }

    try {
      const employeeResult = await apiService.get<any>({ url: `employee/1.0/portalpersondata/personal/${uid}` });

      const { personid, givenname, lastname, fullname, isManager, companyId } = employeeResult.data;

      if (!personid) {
        return done({
          name: 'SAML_EMPOYEE_FAILED',
          message: 'Failed to fetch user from Employee',
        });
      }

      const findUser = {
        companyId: companyId,
        personid,
        userId: uid,
        givenName: givenname,
        surname: lastname,
        name: fullname,
        isManager: isManager ? true : false,
      };

      done(null, findUser);
    } catch (err) {
      if (err instanceof HttpException && err?.status === 404) {
        // TODO: Handle missing person form Citizen?
      }
      done(err);
    }
  },
);

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public swaggerEnabled: boolean;

  constructor(Controllers: Function[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.swaggerEnabled = SWAGGER_ENABLED || false;

    this.initializeDataFolders();

    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    if (this.swaggerEnabled) {
      this.initializeSwagger(Controllers);
    }
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    this.app.use(
      session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
      }),
    );

    this.app.use(passport.initialize());
    this.app.use(passport.session());
    passport.use('saml', samlStrategy);

    this.app.get(
      `${BASE_URL_PREFIX}/saml/login`,
      (req, res, next) => {
        if (req.session.returnTo) {
          req.query.RelayState = req.session.returnTo;
        }
        next();
      },
      (req, res, next) => {
        passport.authenticate('saml', {
          failureRedirect: SAML_FAILURE_REDIRECT,
        })(req, res, next);
      },
    );

    this.app.get(`${BASE_URL_PREFIX}/saml/metadata`, (req, res) => {
      res.type('application/xml');
      const metadata = samlStrategy.generateServiceProviderMetadata(SAML_PUBLIC_KEY, SAML_PUBLIC_KEY);
      res.status(200).send(metadata);
    });

    this.app.get(`${BASE_URL_PREFIX}/saml/logout`, bodyParser.urlencoded({ extended: false }), (req, res, next) => {
      samlStrategy.logout(req as any, () => {
        req.logout(err => {
          if (err) {
            return next(err);
          }
          res.redirect(SAML_LOGOUT_REDIRECT);
        });
      });
    });

    this.app.get(`${BASE_URL_PREFIX}/saml/logout/callback`, bodyParser.urlencoded({ extended: false }), (req, res, next) => {
      req.logout(err => {
        if (err) {
          return next(err);
        }
        res.redirect(SAML_LOGOUT_REDIRECT);
      });
    });

    this.app.post(
      `${BASE_URL_PREFIX}/saml/login/callback`,
      bodyParser.urlencoded({ extended: false }),
      (req, res, next) => {
        passport.authenticate('saml', {
          failureRedirect: SAML_FAILURE_REDIRECT,
        })(req, res, next);
      },
      (req, res, next) => {
        res.redirect(SAML_SUCCESS_REDIRECT);
      },
    );
  }

  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      routePrefix: BASE_URL_PREFIX,
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initializeSwagger(controllers: Function[]) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    });

    const routingControllersOptions = {
      routePrefix: `${BASE_URL_PREFIX}`,
      controllers: controllers,
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas: schemas as { [schema: string]: unknown },
        securitySchemes: {
          basicAuth: {
            scheme: 'basic',
            type: 'http',
          },
        },
      },
      info: {
        description: 'Digital checklista',
        title: 'API',
        version: '1.0.0',
      },
    });

    this.app.use(`${BASE_URL_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(spec));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeDataFolders() {
    const databaseDir: string = join(__dirname, '../data/database');
    if (!existsSync(databaseDir)) {
      mkdirSync(databaseDir, { recursive: true });
    }
    const logsDir: string = join(__dirname, '../data/logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    const sessionsDir: string = join(__dirname, '../data/sessions');
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true });
    }
  }
}

export default App;
