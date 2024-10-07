import { Session } from 'express-session';
import { Request } from 'express';

export interface RequestWithMiddleware extends Request {
  session: SessionWithPassportType;
}

export interface UserType {
  id: number;
  firstname: string;
  lastname: string;
  username?: string;
  password?: string;
}

export interface SessionWithPassportType extends Session {
  passport?: {
    user?: {
      id: string;
      username: string;
    };
  };
}

export interface PrismaErrorType {
  name: string;
  code: string;
  clientVersion: string;
  meta: {
    modelName: string;
    cause: string;
  };
}
