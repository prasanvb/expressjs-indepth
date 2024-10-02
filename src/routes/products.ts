import { reqLoggingMiddleware } from '../middlewares/index';
import { productsList } from '../utils/mocks';
import { Router, Request, Response } from 'express';

const productsRouter = Router();

// API without query paramters
// GET: "/api/products"
productsRouter.get(
  '/api/products',
  reqLoggingMiddleware,
  (req: Request, res: Response) => {
    console.log('req.headers.cookie: ', req.headers.cookie);
    console.log('req.headers.cookie.length: ', req.headers.cookie?.length);
    // cookie paser attachs parsed cookie to the request directly
    console.log('req.cookies: ', req.cookies);
    console.log('req.signedCookies: ', req.signedCookies);

    if (req.signedCookies.token && req.signedCookies.token === 'sample123') {
      res.status(200).send(productsList);
      return;
    }

    res.status(400).send({ message: 'invalid cookie' });
  },
);

export default productsRouter;
