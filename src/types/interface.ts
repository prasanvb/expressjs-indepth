import { Request } from 'express';

export interface RequestWithMiddleware extends Request {
  parsedRouteParamId?: number;
  findUserIndex?: number;
}

export interface UserType {
  id: number;
  firstname: string;
  lastname: string;
  username?: string;
  password?: string;
}
