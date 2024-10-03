import express, { Request, Response } from 'express';
import 'dotenv/config';
import router from './routes/index';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const app = express();
const port = process.env.PORT || 3000;

// Global middleware to parse the request body to json
app.use(express.json());
app.use(cookieParser('secret'));
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

app.use(router);

// root
app.get('/', (_req: Request, res: Response) => {
  // maxAge: 30 sec
  res.cookie('token', 'sample123', { maxAge: 1000 * 30, signed: true });
  res.send('Express-TypeScript-Indepth!!');
});

app.get('/session', (req: Request, res: Response) => {
  // Manipulating session object to simulate authentication
  // @ts-ignore
  req.session.visited = true;

  // console.log('req.sessionStore: ', req.sessionStore);
  // console.log('req.sessionStore: ', req.session);
  console.log('req.session.id: ', req.session.id);

  // Access session store to find total number of active sessions
  req.sessionStore.length
    ? req.sessionStore.length((err, length) => {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log({ length });
      })
    : undefined;

  // Access session data of a specific session id from the session store
  req.sessionStore.get(req.session.id, (err, sessionData) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log({ sessionData });
  });

  res.status(200).json({ message: 'Session API called successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
