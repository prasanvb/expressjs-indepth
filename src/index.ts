import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes/index';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';

// Global declarations
dotenv.config();
const app = express();
const port = process.env.PORT;

// Global middlewares
app.use(express.json());
/*
  NOTE: Below secret in cookieParser is directly used for creating signed cookies 
  this has nothing to do with session secret or session cookies
*/
app.use(cookieParser('secret'));
// TODO: Logging and Tracing
// TODO: Cors
// Session management using express-session
if (process?.env?.SESSION_SECRET)
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      // Set-Cookie attribute HTTP response header is used to send a cookie from the server to the user agent
      cookie: {
        maxAge: 2000 * 60, // maxAge: 2 min
        secure: false, // secure: true requires an https-enabled website
      },
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        ttl: 2 * 60, // time period in seconds. Default 14 days
        autoRemove: 'interval',
        autoRemoveInterval: 2, // time period in minutes. Default 10 mins
        touchAfter: 120, // time period in seconds
      }),
      // Session store: After authentication and user request session dynamical modification if the session is still valid
      // then for every new API request session, the TTL and cookie time extend
      resave: true,
      // Session store: Session is created for every request even if session object is dynamically unmodified
      // (i.e. user not authenticated and user data not added to request session)
      saveUninitialized: false,
    }),
  );
// Authentication using passport
app.use(passport.initialize());
// Dynamically modifies/manipulates request session object and attaches user prop
app.use(passport.session());
// API routes
app.use(router);

// root path
app.get('/', (_req: Request, res: Response) => {
  // Cookie and cookie parser example - "/" and "/api/products"
  res.cookie('token', 'sample123', { maxAge: 1000 * 30, signed: true }); // maxAge: 30 sec
  res.send('Express-TypeScript-Indepth!!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
