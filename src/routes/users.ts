import { Router, Request, Response } from 'express';
import {
  query,
  validationResult,
  checkSchema,
  body,
  matchedData,
} from 'express-validator';
import { userList } from '../utils/mocks';
import { reqLoggingMiddleware, resolveUserIndex } from '../middlewares/index';
import { RequestWithMiddleware } from '../types/interface';
import { userValidationSchema } from '../utils/userValidationSchema';
import { checkIfSessionIsActive } from '../utils/helpers';
import prisma from '../prisma/index';

const userRouter = Router();

// API without query paramters
// GET: "/api/users"
userRouter.get(
  '/api/users',
  reqLoggingMiddleware,
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

// GET: "/api/user/1"
// API with route paramters
// NOTE: Route paramters returned by express is always a string
userRouter.get(
  '/api/user/:username',
  reqLoggingMiddleware,
  async (req: RequestWithMiddleware, res: Response) => {
    const {
      params: { username },
    } = req;

    if (checkIfSessionIsActive(req, res)) {
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
    }
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

// POST: "/api/user" & payload
userRouter.post(
  '/api/user',
  checkSchema(userValidationSchema),
  async (req: Request, res: Response) => {
    const queryValidationResult = validationResult(req);

    if (!queryValidationResult.isEmpty()) {
      res.status(400).json({
        message: 'Invalid body',
        queryValidationResult,
      });
      return;
    }

    // After validation, extracts request body and builds an object with them.
    const data = matchedData(req);
    const { firstname, lastname, username, password } = data;

    try {
      const newUser = await prisma.user.create({
        data: {
          firstname,
          lastname,
          username,
          password,
        },
      });

      res.status(201).send(newUser);
    } catch (error) {
      console.error({ error });
      res.status(400).json({
        message: 'Unable to fulfill create user request',
        error,
      });
    }
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
