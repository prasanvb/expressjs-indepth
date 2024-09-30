import { Request } from 'express';

export interface RequestWithMiddleware extends Request {
  parsedRouteParamId?: number;
  findUserIndex?: number;
}
