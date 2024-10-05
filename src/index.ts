import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes/index';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

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
