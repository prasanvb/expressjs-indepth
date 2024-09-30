import express, { Request, Response } from 'express';
import 'dotenv/config';
import router from './routes/index';

const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARE:
//    Middleware should be always place before all routes
//    we can have multiple middle but the order of calling matters
//    we cannot pass data from one middleware to other middleware but
//    we can dynamically attach properties to request object

// PAYLOAD:
// { firstname: 'ganapathy', lastname: 'parameshara' },

// Global middleware to parse the request body to json
app.use(express.json());
app.use(router);

// root
app.get('/', (req: Request, res: Response) => {
  res.send('Express-TypeScript-Indepth!!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
