import { Router, Request, Response } from 'express';
import {
  query,
  validationResult,
  body,
  matchedData,
  checkSchema,
} from 'express-validator';
import { patchValidationSchema } from '../utils/validationSchema';
import {
  reqLoggingMiddleware,
  checkIfSessionValid,
} from '../middlewares/index';
import {
  RequestWithMiddleware,
  SessionWithPassportType,
  PrismaErrorType,
} from '../types/interface';
import { checkIfSessionIsActive } from '../utils/helpers';
import prisma from '../prisma/index';

const userRouter = Router();

// API without query parameters
// GET: "/api/users"
userRouter.get(
  '/api/users',
  reqLoggingMiddleware,
  checkIfSessionValid,
  async (req: Request, res: Response) => {
    console.log('/api/users', req.session);

    if (checkIfSessionIsActive(req, res)) {
      try {
        const allUsers = await prisma.user.findMany();

        res.status(201).send(allUsers);
      } catch (error) {
        console.error({ error });
        res
          .status(400)
          .json({ message: (error as PrismaErrorType).meta.cause });
      }
    }
  },
);

// API without route parameters
// GET: "/api/user/current"
userRouter.get(
  '/api/user/current',
  reqLoggingMiddleware,
  checkIfSessionValid,
  async (req: RequestWithMiddleware, res: Response) => {
    const username = (req.session as SessionWithPassportType)?.passport?.user
      ?.username;

    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          firstname: true,
          lastname: true,
        },
      });

      if (user) {
        res.status(200).send(user);
      } else {
        res.status(400).json({ message: 'No matching username found' });
        return;
      }
    } catch (error) {
      console.error({ error });
      res.status(400).json({ message: (error as PrismaErrorType).meta.cause });
    }
  },
);

// API with query parameters
// GET: "/api/users/name?contains=y"
userRouter.get(
  '/api/users/name',
  reqLoggingMiddleware,
  checkIfSessionValid,
  query('contains')
    .isString()
    .notEmpty()
    .withMessage('Query string must not be empty')
    .isLength({ min: 1, max: 10 })
    .withMessage('Query string length requirements not met'),
  async (req: Request, res: Response) => {
    const queryValidationResult = validationResult(req);

    // "/api/users/filter" no qurey param
    if (Object.keys(req.query).length === 0) {
      res.status(404).json({ message: 'Empty query parameter' });
      return;
    }

    // "/api/users/filter?name=12" invalid query param
    if (!queryValidationResult.isEmpty()) {
      res.status(400).json({ message: 'Invalid query parameter' });
      return;
    }

    // obtaining query params from req
    const data = matchedData(req);
    const { contains } = data;

    if (checkIfSessionIsActive(req, res)) {
      try {
        const matchingUsers = await prisma.user.findMany({
          where: {
            OR: [
              {
                firstname: {
                  contains,
                },
              },
              {
                lastname: {
                  contains,
                },
              },
            ],
          },
        });

        if (matchingUsers.length > 0) {
          res.status(200).send(matchingUsers);
        } else {
          res
            .status(400)
            .json({ message: 'No matching user with given name found' });
          return;
        }
      } catch (error) {
        console.error({ error });
        res
          .status(400)
          .json({ message: (error as PrismaErrorType).meta.cause });
      }
    }
  },
);

// API without route parameters
// PATCH: "/api/user/current" & payload
userRouter.patch(
  '/api/user/current',
  reqLoggingMiddleware,
  checkIfSessionValid,
  checkSchema(patchValidationSchema),
  async (req: RequestWithMiddleware, res: Response) => {
    const queryValidationResult = validationResult(req);

    if (!queryValidationResult.isEmpty()) {
      res.status(400).json({
        message: 'Invalid body.',
        queryValidationResult,
      });
      return;
    }

    const username = (req.session as SessionWithPassportType)?.passport?.user
      ?.username;

    const { body } = req;
    try {
      const updatedUser = await prisma.user.update({
        where: {
          username,
        },
        data: {
          ...body,
        },
        select: {
          username: true,
          firstname: true,
          lastname: true,
        },
      });

      if (updatedUser) {
        res.status(200).send(updatedUser);
      } else {
        res.status(400).json({ message: 'No matching username found' });
        return;
      }
    } catch (error) {
      console.error({ error });
      res.status(400).json({ message: (error as PrismaErrorType).meta.cause });
    }
  },
);

// API with route parameters
// NOTE: Route parameters returned by express is always a string
// PUT: "/api/user/pv" & payload
userRouter.put(
  '/api/user/:username',
  reqLoggingMiddleware,
  checkIfSessionValid,
  [
    body('firstname').isString().withMessage('firstname must be a string'),
    body('lastname').isString().withMessage('lastname must be a string'),
  ],
  async (req: RequestWithMiddleware, res: Response) => {
    const queryValidationResult = validationResult(req);

    if (!queryValidationResult.isEmpty()) {
      res.status(400).json({
        message: 'Invalid body.',
        queryValidationResult,
      });
      return;
    }

    const {
      params: { username },
      body: { firstname, lastname },
    } = req;

    try {
      const updatedUser = await prisma.user.upsert({
        where: {
          username,
        },
        update: {
          firstname,
          lastname,
        },
        create: {
          username,
          firstname,
          lastname,
          password: 'asd123',
        },
        select: {
          username: true,
          firstname: true,
          lastname: true,
        },
      });

      if (updatedUser) {
        res.status(200).send(updatedUser);
      } else {
        res.status(400).json({ message: 'No matching username found' });
        return;
      }
    } catch (error) {
      console.error({ error });
      res.status(400).json({ message: (error as PrismaErrorType).meta.cause });
    }
  },
);

// API with route parameters
// NOTE: Route parameters returned by express is always a string
// DELETE: "/api/user/pv"
userRouter.delete(
  '/api/user/:username',
  reqLoggingMiddleware,
  checkIfSessionValid,
  async (req: RequestWithMiddleware, res: Response) => {
    const {
      params: { username },
    } = req;

    const sessionusername = (req.session as SessionWithPassportType)?.passport
      ?.user?.username;

    if (username === sessionusername) {
      res.status(400).json({
        message: 'You cannot delete yourself, try deleting other users',
      });
      return;
    }

    try {
      const deleteUser = await prisma.user.delete({
        where: {
          username,
        },
        select: {
          username: true,
        },
      });

      if (deleteUser) {
        res
          .status(200)
          .send({ message: 'User deleted successfully', deleteUser });
      } else {
        res.status(400).json({
          message: 'User not found',
        });
      }
    } catch (error) {
      console.error({ error });
      res.status(400).json({ message: (error as PrismaErrorType).meta.cause });
    }
  },
);

export default userRouter;
