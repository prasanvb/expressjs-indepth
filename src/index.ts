import express, { Request, Response } from 'express';
import 'dotenv/config';
import router from './routes/index';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { userList } from './utils/mocks';
import { fetchSessionData, fetchActiveSessionLength } from './utils/helpers';
import passport from 'passport';
// simply loads the whole module
import './strategies/localStrategy';

const app = express();
const port = process.env.PORT || 3000;

// Global middlewares
app.use(express.json());
/*
  NOTE: secret in cookieParser is directly used for creating signed cookies 
  this has nothing to do with session secret or session cookies
*/
app.use(cookieParser('secret'));
// Logging and Tracing
// TODO: app.use(logger());
// Session management using express-session
app.use(
  session({
    secret: 'sessionSecret',
    resave: false,
    saveUninitialized: false,
    // Set-Cookie attribute HTTP response header is used to send a cookie from the server to the user agent
    cookie: {
      maxAge: 1000 * 60, // maxAge: 1 min
      secure: false, // secure: true requires an https-enabled website
    },
  }),
);

// Authentication using passport
app.use(passport.initialize());
// Dynamically manipulates request session object and attaches user prop
app.use(passport.session());

app.use(router);

// root path
app.get('/', (_req: Request, res: Response) => {
  // maxAge: 30 sec
  res.cookie('token', 'sample123', { maxAge: 1000 * 30, signed: true });
  res.send('Express-TypeScript-Indepth!!');
});

// Authentication using passport
app.post(
  '/api/auth',
  passport.authenticate('local', {}),
  (req: Request, res: Response) => {
    // Access session store to find total number of active sessions
    fetchActiveSessionLength(req);

    // Access session data of a specific session id from the session store
    fetchSessionData(req);

    res
      .status(200)
      .json({ message: 'User authenticated successfully by Passport' });
  },
);

app.get('/api/auth/status', (req: Request, res: Response) => {
  console.log(req.session);
  // @ts-ignore
  req.session.passport.user ? res.sendStatus(200) : res.sendStatus(401);
});

// session examples
// Manipulate session object and add "user" prop
app.post('/session/auth', (req: Request, res: Response) => {
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
  res.status(200).json({ message: 'User authenticated successfully' });
});

app.get('/session/auth/status', (req: Request, res: Response) => {
  // Access session store to find total number of active sessions
  fetchActiveSessionLength(req);

  // Access session data of a specific session id from the session store
  fetchSessionData(req);

  // @ts-ignore
  req.session.user ? res.sendStatus(200) : res.sendStatus(401);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
