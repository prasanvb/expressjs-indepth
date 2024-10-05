import { Router, Request, Response } from 'express';
import { validationResult, checkSchema, matchedData } from 'express-validator';
import { userValidationSchema } from '../utils/userValidationSchema';
import prisma from '../prisma/index';

const onboardingRouter = Router();

onboardingRouter.post(
  '/api/onboard',
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

      if (newUser) {
        res.status(201).send(newUser);
      } else {
        res.status(400).json({
          message: 'Failed to onboard new user',
        });
      }
    } catch (error) {
      console.error({ error });
      res.status(400).json({
        message: 'Error, on trying to onboard new user',
        error,
      });
    }
  },
);

export default onboardingRouter;
