import { userList } from '../utils/mocks';
import { Request, Response, NextFunction } from 'express';
import { RequestWithMiddleware } from '../types/interface';

// Custome middleware
export const reqLoggingMiddleware = (
  req: Request,
  res: Response,
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

export const resolveUserIndex = (
  req: RequestWithMiddleware,
  res: Response,
  next: NextFunction,
) => {
  const {
    params: { id },
  } = req;

  // TODO: parseInt has a issues with route params like 2f, need to use regex
  const parsedRouteParamId = parseInt(id);

  if (isNaN(parsedRouteParamId)) {
    res.status(400).json({ message: 'Invalid Id.' });
    return;
  }

  const findUserIndex = userList.findIndex(
    (user) => user.id === parsedRouteParamId,
  );

  // We can dynamically attach properties to request object
  req.parsedRouteParamId = parsedRouteParamId;
  req.findUserIndex = findUserIndex;

  next();
};
