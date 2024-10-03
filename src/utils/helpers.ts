import { Request } from 'express';

export const fetchSessionData = (req: Request) => {
  req.sessionStore.get(req.session.id, (err, session) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log({ id: req.session.id, session });
  });
};

export const fetchActiveSessionLength = (req: Request) => {
  req.sessionStore.length
    ? req.sessionStore.length((err, length) => {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log({ length });
      })
    : console.log({ length: undefined });
};
