import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

interface RequestWithMiddleware extends Request {
  parsedRouteParamId?: number;
  findUserIndex?: number;
}

// MIDDLEWARE:
//    Middleware should be always place before all routes
//    we can have multiple middle but the order of calling matters
//    we cannot pass data from one middleware to other middleware but
//    we can dynamically attach properties to request object

// PAYLOAD:
// { firstname: 'ganapathy', lastname: 'parameshara' },

// Global middleware to parse the request body to json
app.use(express.json());

// Custome middleware
const reqLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // we do request manipulation and validation using middleware
  console.log({
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body,
  });
  next();
};

const resolveUserIndex = (
  req: RequestWithMiddleware,
  res: Response,
  next: NextFunction,
) => {
  const {
    params: { id },
  } = req;

  // TODO: parseInt has a issues with route params like 2f, need to use regex
  const parsedRouteParamId = parseInt(id);

  if (isNaN(parsedRouteParamId)) {
    res.status(400).json({ message: 'Invalid Id.' });
    return;
  }

  const findUserIndex = userList.findIndex(
    (user) => user.id === parsedRouteParamId,
  );

  // We can dynamically attach properties to request object
  req.parsedRouteParamId = parsedRouteParamId;
  req.findUserIndex = findUserIndex;

  next();
};

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
    res.status(200).send(userList);
    // Though res.send() sends the response back to the client, the code execution doesn't stop there.
    return;
  }

  const { firstname } = req.query as { firstname: string };

  if (firstname === undefined) {
    res.status(400).json({ message: 'Invalid query parameter' });
    return;
  }

  const users = userList.filter((user) => user.firstname.includes(firstname));

  if (users.length < 1) {
    res.status(400).json({ message: 'No matching user found' });
    // If no return statement then throws Error: Cannot set headers after they are sent to the client.
    return;
  }

  res.status(200).send(users);
});

// GET: "/api/user/1"
// API with route paramters
// NOTE: Route paramters returned by express is always a string
app.get(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  (req: RequestWithMiddleware, res: Response) => {
    const user = userList.find((user) => user.id === req.parsedRouteParamId);

    if (user === undefined) {
      res.status(400).json({ message: 'User with a given id not found.' });
      // Though res.send() sends the response back to the client, the code execution doesn't stop there.
      // If no return statement then throws Error: Cannot set headers after they are sent to the client.
      return;
    }

    res.status(200).send(user);
  },
);

// POST: "/api/user" & payload
app.post('/api/user', (req: Request, res: Response) => {
  const { firstname, lastname } = req.body;

  if (firstname === undefined || lastname === undefined) {
    res.status(400).json({ message: 'Invalid body.' });
    return;
  }

  const newUser = { id: userList.length + 1, firstname, lastname };
  userList.push(newUser);
  res.status(201).send(userList);
});

// PUT: "/api/user/1" & payload
app.put(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  (req: RequestWithMiddleware, res: Response) => {
    const { findUserIndex, parsedRouteParamId, body } = req;

    if (findUserIndex === -1 || findUserIndex === undefined) {
      res.status(400).json({ message: 'Id not found.' });
      return;
    }

    if (Object.keys(body).length === 0) {
      res.status(400).json({ message: 'Invalid body.' });
      return;
    }

    const overWriteUser = { id: parsedRouteParamId, ...body };
    userList[findUserIndex] = overWriteUser;

    res.status(200).send(userList);
  },
);

// PATCH: "/api/user/1" & payload
app.patch(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  (req: RequestWithMiddleware, res: Response) => {
    const { findUserIndex, body } = req;

    if (findUserIndex === -1 || findUserIndex === undefined) {
      res.status(400).json({ message: 'Id not found.' });
      return;
    }

    if (Object.keys(body).length === 0) {
      res.status(400).json({ message: 'Invalid body.' });
      return;
    }

    const updatedUser = {
      ...structuredClone(userList[findUserIndex]),
      ...body,
    };

    userList[findUserIndex] = updatedUser;
    res.status(200).send(userList);
  },
);

// DELETE: "/api/user/1"
app.delete(
  '/api/user/:id',
  reqLoggingMiddleware,
  resolveUserIndex,
  (req: RequestWithMiddleware, res: Response) => {
    const { findUserIndex } = req;

    if (findUserIndex === -1 || findUserIndex === undefined) {
      res.status(400).json({ message: 'Id not found.' });
      return;
    }

    userList.splice(findUserIndex, 1);

    res.sendStatus(200);
  },
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
