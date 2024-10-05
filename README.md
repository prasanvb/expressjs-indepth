# EXPRESS-TYPESCRIPT-INDEPTH

## Environment variables

- `PORT=3000`
- `DATABASE_URL="mongodb+srv://<username>:<password>@<cluster_name>/<colection_name>?retryWrites=true&w=majority"`

## MIDDLEWARE

- Middleware should be always place before all routes
- We can have multiple middle but the order of calling matters
- We cannot pass data from one middleware to other middleware
- We can dynamically attach properties to request object

NOTE: Client can be different application from same IP, eg, postman, browser, insomnia

## COOKIES

- Cookies are key/value pairs that contains a small piece data
  - Unsigned cookies
  - Signed cookies
  - Lifespan of a cookie
- It is set by the server on the response object and sent to the client
  - The client includes the cookies in the request object every time for all future calls
  - Client includes the cookies until it expires or its manually deleted in client side
  - Server setting cookie `res.cookie('token', 'sample123', { maxAge: 1000 * 30, signed: true });`
  - Client sending unparsed cookie back `req.headers.cookie`
- Cookie Parser middleware
  - Cookie returned by client in string format, we use middleware to parse it to JSON format
  - Cookie parser attaches parsed cookie to the request directly
  - Also used for signing the cookies with a secret

## SESSIONS

- Session management using express-session
  - Session data is not saved in the cookie itself, just the session ID. Session data is stored server-side
  - Session ID in the cookie get stored on the client side, so every time client makes call to server the cookie gets included
  - By default session data is stored in memory but it can be stored in persistence database
  - Persistent session stores can be implemented using redis, dynamoDB, etc.
  - At given point in time there might be many client sessions and server maps each session to differnt user

## [PASSPORT](https://github.com/jaredhanson/passport)

- Passport is authentication middleware that provides various strategies for user authentication
- Passport local strategy used along with sessions takes care of mapping the authenticated user with the sessions
- We provide functions to Passport that performs the necessary authentication, serialization and deserialization logic
- In order for persistent sessions to work, the after successful authentication user must be serialized to the session (i.e. Dynamically manipulates request session object and attaches "user" property), and deserialized when subsequent requests are made (i.e. Verify if the authentication is still valid by checking session object).

## PRISMA

- Install Prisma CLI globally (`npm install -g prisma`) to run commands from you CLI
  - `prisma help`
- `prisma db push` - push prisma document model into database and run it every time you update the model
- `prisma generate` - generate prisma client that you can use inside the server routes/API

## EXAMPLES

- [REST API - HTTP methods](src/routes/users.ts)
- [Cookies and Cookie Parser](src/routes/products.ts)
- [Express Session](src/routes/session.ts)
