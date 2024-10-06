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
import { RequestWithMiddleware } from '../types/interface';
import { checkIfSessionIsActive } from '../utils/helpers';
import prisma from '../prisma/index';

const userRouter = Router();

// API without query paramters
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
        res.status(400).json({
          message: 'Unable to fetch all users',
          error,
        });
      }
    }
  },
);

// GET: "/api/user/pv"
// API with route paramters
// NOTE: Route paramters returned by express is always a string
userRouter.get(
  '/api/user/:username',
  reqLoggingMiddleware,
  checkIfSessionValid,
  async (req: RequestWithMiddleware, res: Response) => {
    const {
      params: { username },
    } = req;

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
      res
        .status(400)
        .json({ message: 'Error, unable to query user collection', error });
    }
  },
);

// API with query paramters
// GET: "/api/users/filter?name=y"
userRouter.get(
  '/api/users/filter',
  reqLoggingMiddleware,
  checkIfSessionValid,
  query('name')
    .isString()
    .notEmpty()
    .withMessage('Name must not be empty')
    .isLength({ min: 1, max: 10 })
    .withMessage('Name length requirements not met'),
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

    const data = matchedData(req);
    const { name } = data;

    if (checkIfSessionIsActive(req, res)) {
      try {
        const matchingUsers = await prisma.user.findMany({
          where: {
            OR: [
              {
                firstname: {
                  contains: name,
                },
              },
              {
                lastname: {
                  contains: name,
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
        res
          .status(400)
          .json({ message: 'Error, unable to query user collection', error });
      }
    }
  },
);

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
      const updatedUser = await prisma.user.update({
        where: {
          username,
        },
        data: {
          firstname,
          lastname,
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
      res
        .status(400)
        .json({ message: 'Error, unable to overwrite user collection', error });
    }
  },
);

// PATCH: "/api/user/pv" & payload
userRouter.patch(
  '/api/user/:username',
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

    const {
      params: { username },
      body,
    } = req;

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
      res
        .status(400)
        .json({ message: 'Error, unable to overwrite user collection', error });
    }
  },
);

// DELETE: "/api/user/pv"
userRouter.delete(
  '/api/user/:username',
  reqLoggingMiddleware,
  checkIfSessionValid,
  async (req: RequestWithMiddleware, res: Response) => {
    const {
      params: { username },
    } = req;

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
      res.status(400).json({
        message: 'Error, unable to delete user from collection',
        error,
      });
    }
  },
);

export default userRouter;
