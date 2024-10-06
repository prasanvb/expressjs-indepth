import { SessionWithPassportType } from '../types/interface';
import { Request, Response, NextFunction } from 'express';

// Custome middleware
export const reqLoggingMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // we do request manipulation and validation using middleware
  console.log({
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body,
  });
  next();
};

export const checkIfAlreadyLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if ((req.session as SessionWithPassportType)?.passport?.user) {
    res.status(400).json({
      message: 'User already authenticated. Logout to login as different user',
    });
    return;
  }

  next();
};

export const checkIfSessionValid = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!(req.session as SessionWithPassportType)?.passport?.user) {
    res.status(400).json({ message: 'User not authenticated' });
    return;
  }
  next();
};
