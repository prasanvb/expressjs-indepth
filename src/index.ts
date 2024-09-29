import express, { Request, Response } from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

const userList = [
  { id: 1, firstname: 'prasan', lastname: 'bala' },
  { id: 2, firstname: 'ganesh', lastname: 'siva' },
  { id: 3, firstname: 'karthikeya', lastname: 'siva' },
];
app.get('/', (req: Request, res: Response) => {
  res.send('Express-TypeScript-Indepth!!');
});

app.get('/api/users', (req: Request, res: Response) => {
  res.send(userList);
});

// api with route paramters
// NOTE: route paramters returned by express is always a string
app.get('/api/users/:id', (req: Request, res: Response) => {
  // TODO: parseInt has a issues with route params like 2f, need to use regex
  const parsedRouteParamId = parseInt(req.params.id);

  if (isNaN(parsedRouteParamId)) {
    res.status(400).send({ message: 'Bad Request. Invalid Id.' });
  }

  const user = userList.find((user) => user.id === parsedRouteParamId);

  if (user === undefined) {
    res.status(400).send({ message: 'Id not found.' });
  }

  res.send(user);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
