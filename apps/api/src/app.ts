import express from 'express';
import cookieParser from 'cookie-parser';
import { httpLogger } from './utils/logger';
import { security } from './middlewares/security';
import { errorHandler } from './middlewares/error';
import routes from './routes';
export const app = express();
app.set('trust proxy', 1);
// security (incl. rate limiting) runs before body parsing, so an
// unauthenticated flood gets throttled before we spend CPU parsing bodies.
app.use(security);
app.use(cookieParser());
app.use(express.json({ limit:'1mb' }));
app.use(httpLogger);
app.use('/api/v1', routes);
app.use(errorHandler);
