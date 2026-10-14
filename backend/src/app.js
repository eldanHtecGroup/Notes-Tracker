import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { readFileSync } from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import config from './config/index.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

const openapiSpec = YAML.parse(
  readFileSync(new URL('../docs/openapi.yaml', import.meta.url), 'utf8'),
);

// Mounted before helmet so its CSP doesn't block Swagger UI's assets
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

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
