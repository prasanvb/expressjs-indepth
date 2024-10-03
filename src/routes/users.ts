import { Router, Request, Response } from 'express';
import { query, validationResult, checkSchema, body } from 'express-validator';
import { userList } from '../utils/mocks';
import { reqLoggingMiddleware, resolveUserIndex } from '../middlewares/index';

import { RequestWithMiddleware } from '../types/interface';
import { userValidationSchema } from '../utils/userValidationSchema';
import { fetchActiveSessionLength, fetchSessionData } from '../utils/helpers';

const userRouter = Router();

// API without query paramters
// GET: "/api/users"
userRouter.get(
  '/api/users',
  reqLoggingMiddleware,
  (req: Request, res: Response) => {
    console.log('users-req.sessionStore: ', req.session);
    console.log('users-req.session.id: ', req.session.id);

    // Access session store to find total number of active sessions
    fetchActiveSessionLength(req);

    // Access session data of a specific session id from the session store
    fetchSessionData(req);

    res.status(200).send(userList);
  },
);

// API with query paramters
// GET: "/api/users/filter?name=y"
userRouter.get(
  '/api/users/filter',
  reqLoggingMiddleware,
  query('name')
    .isString()
    .notEmpty()
    .withMessage('Name must not be empty')
    .isLength({ min: 1, max: 10 })
    .withMessage('Name length requirements not met'),
  (req: Request, res: Response) => {
    const queryValidationResult = validationResult(req);
    console.log(queryValidationResult);

    // "/api/users/filter" no qurey param
    if (Object.keys(req.query).length === 0) {
      // Response includes only default http status message
      res.sendStatus(404);
      // Though res.send() sends the response back to the client, the code execution doesn't stop there.
      return;
    }

    // "/api/users/filter?name=12" invalid query param
    if (!queryValidationResult.isEmpty()) {
      res.status(400).json({ message: 'Invalid query parameter' });
      return;
    }

    const { name } = req.query as { name: string };

    const users = userList.filter(
      (user) => user.firstname.includes(name) || user.lastname.includes(name),
    );

    if (users.length < 1) {
      res.status(400).json({ message: 'No matching user found' });
      // If no return statement then throws Error: Cannot set headers after they are sent to the client.
      return;
    }

    res.status(200).send(users);
  },
);

// GET: "/api/user/1"
// API with route paramters
// NOTE: Route paramters returned by express is always a string
userRouter.get(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  (req: RequestWithMiddleware, res: Response) => {
    const user = userList.find((user) => user.id === req.parsedRouteParamId);

    if (user === undefined) {
      res.status(400).json({
        message: 'User with a given id not found.',
      });
      // Though res.send() sends the response back to the client, the code execution doesn't stop there.
      // If no return statement then throws Error: Cannot set headers after they are sent to the client.
      return;
    }

    res.status(200).send(user);
  },
);

// POST: "/api/user" & payload
userRouter.post(
  '/api/user',
  checkSchema(userValidationSchema),
  (req: Request, res: Response) => {
    const queryValidationResult = validationResult(req);

    if (!queryValidationResult.isEmpty()) {
      res.status(400).json({
        message: 'Invalid body.',
        queryValidationResult,
      });
      return;
    }

    const { firstname, lastname } = req.body;
    const newUser = {
      id: userList.length + 1,
      firstname,
      lastname,
    };
    userList.push(newUser);
    res.status(201).send(userList);
  },
);

// PUT: "/api/user/1" & payload
userRouter.put(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  [
    body('firstname').isString().withMessage('firstname must be a string'),
    body('lastname').isString().withMessage('lastname must be a string'),
  ],
  (req: RequestWithMiddleware, res: Response) => {
    const queryValidationResult = validationResult(req);

    if (!queryValidationResult.isEmpty()) {
      res.status(400).json({
        message: 'Invalid body.',
        queryValidationResult,
      });
      return;
    }

    const {
      findUserIndex,
      parsedRouteParamId,
      body: { firstname, lastname },
    } = req;

    if (findUserIndex === undefined || parsedRouteParamId === undefined) {
      res.status(400).json({ message: 'Id not found.' });
      return;
    }

    const overWriteUser = {
      id: parsedRouteParamId,
      firstname,
      lastname,
    };

    if (findUserIndex < 0) {
      userList.push(overWriteUser);
    } else {
      userList[findUserIndex] = overWriteUser;
    }

    res.status(200).send(userList);
  },
);

// PATCH: "/api/user/1" & payload
userRouter.patch(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  (req: RequestWithMiddleware, res: Response) => {
    const { findUserIndex, body } = req;

    if (findUserIndex === -1 || findUserIndex === undefined) {
      res.status(400).json({ message: 'Id not found.' });
      return;
    }

    if (Object.keys(body).length === 0) {
      res.status(400).json({ message: 'Invalid body.' });
      return;
    }

    const updatedUser = {
      ...structuredClone(userList[findUserIndex]),
      ...body,
    };

    userList[findUserIndex] = updatedUser;
    res.status(200).send(userList);
  },
);

// DELETE: "/api/user/1"
userRouter.delete(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  (req: RequestWithMiddleware, res: Response) => {
    const { findUserIndex } = req;

    if (findUserIndex === -1 || findUserIndex === undefined) {
      res.status(400).json({ message: 'Id not found.' });
      return;
    }

    userList.splice(findUserIndex, 1);

    // Response includes only default http status message
    res.sendStatus(200);
  },
);

export default userRouter;
