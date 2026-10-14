import { Router } from 'express';
import noteRoutes from './note.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/notes', noteRoutes);

export default router;
