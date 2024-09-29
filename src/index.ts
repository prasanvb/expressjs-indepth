import express, { Request, Response } from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse the request body to json
app.use(express.json());

const userList = [
  { id: 1, firstname: 'prasan', lastname: 'bala' },
  { id: 2, firstname: 'ganesh', lastname: 'siva' },
  { id: 3, firstname: 'karthikeya', lastname: 'siva' },
];

// root
app.get('/', (req: Request, res: Response) => {
  res.send('Express-TypeScript-Indepth!!');
});

// API without or with query paramters
// GET: "/api/users"
// GET: "/api/users?firstname=an"
app.get('/api/users', (req: Request, res: Response) => {
  if (Object.keys(req.query).length === 0) {
    res.send(userList);
  }

  const { firstname } = req.query as { firstname: string };

  if (firstname === undefined) {
    res.status(400).send({ message: 'Invalid query parameter' });
    return;
  }

  const users = userList.filter((user) => user.firstname.includes(firstname));

  if (users.length < 1) {
    res.status(400).json({ message: 'No matching user found' });
    // Though res.send() sends the response back to the client, the code execution doesn't stop there.
    // If no return statement then throws Error: Cannot set headers after they are sent to the client.
    return;
  }

  res.status(200).send(users);
});

// GET: "/api/user/1"
// API with route paramters
// NOTE: Route paramters returned by express is always a string
app.get('/api/user/:id', (req: Request, res: Response) => {
  // TODO: parseInt has a issues with route params like 2f, need to use regex
  const parsedRouteParamId = parseInt(req.params.id);

  if (isNaN(parsedRouteParamId)) {
    res.status(400).send({ message: 'Invalid Id.' });
  }

  const user = userList.find((user) => user.id === parsedRouteParamId);

  if (user === undefined) {
    res.status(400).send({ message: 'Id not found.' });
    // Though res.send() sends the response back to the client, the code execution doesn't stop there.
    // If no return statement then throws Error: Cannot set headers after they are sent to the client.
    return;
  }

  res.status(200).send(user);
});

// POST: "/api/user"
app.post('/api/user', (req: Request, res: Response) => {
  const { firstname, lastname } = req.body;

  if (firstname === undefined || lastname === undefined) {
    res.status(400).send({ message: 'Invalid body.' });
    return;
  }

  const newUser = { id: userList.length + 1, firstname, lastname };
  userList.push(newUser);
  res.status(201).send(userList);
});

app.put('/api/user/:id', (req: Request, res: Response) => {
  const {
    body,
    params: { id },
  } = req;

  // TODO: parseInt has a issues with route params like 2f, need to use regex
  const parsedRouteParamId = parseInt(id);

  if (isNaN(parsedRouteParamId)) {
    res.status(400).send({ message: 'Invalid Id.' });
    return;
  }

  const findUserIndex = userList.findIndex(
    (user) => user.id === parsedRouteParamId,
  );

  if (findUserIndex === -1) {
    res.status(400).send({ message: 'Id not found.' });
    return;
  }

  if (Object.keys(body).length === 0) {
    res.status(400).send({ message: 'Invalid body.' });
    return;
  }

  const newUser = { id: parsedRouteParamId, ...body };
  userList[findUserIndex] = newUser;

  res.status(200).send(userList);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
