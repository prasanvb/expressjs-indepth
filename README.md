# EXPRESS-TYPESCRIPT-INDEPTH

## SAMPLE PAYLOAD

- `{ firstname: 'ganapathy', lastname: 'parameshara' }`

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

## PASSPORT

- Passport is authentication middleware that provides various strategies for user authentication
- Passport local strategy used along with sessions takes care of mapping the authenticated user with the sessions
- 