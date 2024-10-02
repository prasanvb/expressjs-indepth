# EXPRESS-TYPESCRIPT-INDEPTH

## SAMPLE PAYLOAD

- `{ firstname: 'ganapathy', lastname: 'parameshara' }`

## MIDDLEWARE

- Middleware should be always place before all routes
- We can have multiple middle but the order of calling matters
- We cannot pass data from one middleware to other middleware
- We can dynamically attach properties to request object

## COOKIES

- Cookies are key/value pairs that contains a small piece data
  - Unsigned cookies
  - Signed cookies
  - Lifespan of a cookie
- It is set by the server on the response object and sent to the client, the client includes the cookies in the request object
  - server setting cookie `res.cookie('token', 'sample123', { maxAge: 1000 * 30, signed: true });`
  - client sending unparsed cookie back `req.headers.cookie`
  - client includes the cookies if it expires or if its manually deleted in client side
- Cookie Parser
  - Cookie returned by client in string format, we use middleware to parse it to JSON format
  - Cookie parser attaches parsed cookie to the request directly
  - Also used for signing the cookies with a secret
