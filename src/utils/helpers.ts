import { Request, Response } from 'express';

export const fetchSessionData = (req: Request) => {
  req.sessionStore.get(req.session.id, (err, session) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log('sessionData', { id: req.session.id, session });
  });
};

export const fetchActiveSessionLength = (req: Request) => {
  req.sessionStore.length
    ? req.sessionStore.length((err, length) => {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log('Active session length', length);
      })
    : console.log({ length: undefined });
};

export const checkIfSessionIsActive = (req: Request, res: Response) => {
  // @ts-ignore
  if (!req?.session?.passport?.user) {
    res.status(400).json({ message: 'User not authenticated' });
    return false;
  }
  return true;
};
