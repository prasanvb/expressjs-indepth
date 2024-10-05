import { userList } from '../utils/mocks';
import { fetchActiveSessionLength, fetchSessionData } from '../utils/helpers';
import { Router, Request, Response } from 'express';

const sessionRouter = Router();

// session examples
// Manipulate session object and add "user" prop
sessionRouter.post('/session/auth', (req: Request, res: Response) => {
  const {
    body: { username, password },
  } = req;

  const getUser = userList.find(
    (user) => user.username === username && user.password === password,
  );

  if (!getUser) {
    res.status(401).json({ message: 'Invalid user credentials' });
    return;
  }

  // Access session store to find total number of active sessions
  fetchActiveSessionLength(req);

  // Access session data of a specific session id from the session store
  fetchSessionData(req);

  // Manipulating session object to simulate authentication
  // @ts-ignore
  req.session.user = getUser;
  res.status(200).json({ message: 'Session authenticated successfully' });
});

sessionRouter.get('/session/auth/status', (req: Request, res: Response) => {
  // Access session store to find total number of active sessions
  fetchActiveSessionLength(req);

  // Access session data of a specific session id from the session store
  fetchSessionData(req);

  // @ts-ignore
  req.session.user ? res.sendStatus(200) : res.sendStatus(401);
});

// NOTE: trying calling this route before '/session/auth'
sessionRouter.get('/session/users', (req: Request, res: Response) => {
  console.log('users-req.sessionStore: ', req.session);
  console.log('users-req.session.id: ', req.session.id);

  // Access session store to find total number of active sessions
  fetchActiveSessionLength(req);

  // Access session data of a specific session id from the session store
  fetchSessionData(req);

  res.status(200).send(userList);
});

export default sessionRouter;
