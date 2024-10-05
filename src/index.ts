import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes/index';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
// simply loads the whole module
import './passport/localStrategy';
// import { fetchSessionData, fetchActiveSessionLength } from './utils/helpers';

// Global declarations
dotenv.config();
const app = express();
const port = process.env.PORT;

// Global middlewares
app.use(express.json());
/*
  NOTE: secret in cookieParser is directly used for creating signed cookies 
  this has nothing to do with session secret or session cookies
*/
app.use(cookieParser('secret'));
// TODO: Logging and Tracing
// TODO: Cors
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
  // Cookie and cookie parser example - "/" and "/api/products"
  res.cookie('token', 'sample123', { maxAge: 1000 * 30, signed: true }); // maxAge: 30 sec
  res.send('Express-TypeScript-Indepth!!');
});

// Authentication using passport
app.post(
  '/api/auth',
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

app.get('/api/auth/status', (req: Request, res: Response) => {
  console.log('auth status req', req.session);
  // @ts-ignore
  req?.session?.passport?.user ? res.sendStatus(200) : res.sendStatus(401);
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  console.log('logout request', req.session);
  // check if user prop still attached to session data
  // @ts-ignore
  if (!req?.session?.passport?.user) {
    res.status(401).json({ message: 'User session not active any more' });
  }

  // logout method is attached to req by passport
  req.logOut({}, (error) => {
    if (error) {
      res.status(401).json({ message: 'Error trying to logout user', error });
    }

    res.status(200).json({ message: 'User logout successful' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
