import express, { Request, Response } from 'express';
import 'dotenv/config';
import router from './routes/index';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 3000;


// Global middleware to parse the request body to json
app.use(express.json());
app.use(cookieParser('secret'));
app.use(router);

// root
app.get('/', (_req: Request, res: Response) => {
  // maxAge: 30 sec
  res.cookie('token', 'sample123', { maxAge: 1000 * 30, signed: true });
  res.send('Express-TypeScript-Indepth!!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
