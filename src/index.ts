import express, { Request, Response } from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Express-TypeScript-Indepth!!');
});

app.get('/api/users', (req: Request, res: Response) => {
  console.log({ req });
  res.send([
    { id: 1, firstname: 'prasan', lastname: 'bala' },
    { id: 2, firstname: 'ganesh', lastname: 'siva' },
    { id: 3, firstname: 'karthikeya', lastname: 'siva' },
  ]);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
