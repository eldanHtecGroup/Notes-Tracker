import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import config from './config/index.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(':method :url :status :response-time ms', {
    stream: { write: (line) => logger.debug(line.trim()) },
  }),
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
