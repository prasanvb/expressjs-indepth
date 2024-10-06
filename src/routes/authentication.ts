import { Router, Request, Response } from 'express';
import { checkIfAlreadyLoggedIn } from '../middlewares/index';
import passport from 'passport';
// simply loads the whole module
import '../passport/localStrategy';
import { SessionWithPassportType } from '../types/interface';

const authenticationRouter = Router();

// Authentication using passport
authenticationRouter.post(
  '/api/auth',
  checkIfAlreadyLoggedIn,
  // calls the passport/localStrategy.ts
  passport.authenticate('local', {}),
  (_req: Request, res: Response) => {
    // Access session store to find total number of active sessions
    // fetchActiveSessionLength(req);

    // Access session data of a specific session id from the session store
    // fetchSessionData(req);
    res
      .status(200)
      .json({ message: 'User authenticated successfully by Passport' });
  },
);

authenticationRouter.get('/api/auth/status', (req: Request, res: Response) => {
  console.log('auth status req', req.session);
  (req.session as SessionWithPassportType)?.passport?.user
    ? res.sendStatus(200)
    : res.sendStatus(401);
});

authenticationRouter.post('/api/auth/logout', (req: Request, res: Response) => {
  console.log('logout request', req.session);
  // check if user prop still attached to session data
  if (!(req.session as SessionWithPassportType)?.passport?.user) {
    res.status(401).send({ message: 'User session not active any more' });
    return;
  }

  // logout method is attached to req by passport
  req.logOut({}, (error) => {
    if (error) {
      res.status(401).json({ message: 'Error trying to logout user', error });
      return;
    }

    res.status(200).json({ message: 'User logout successful' });
  });
});

export default authenticationRouter;
