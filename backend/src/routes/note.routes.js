import { Router } from 'express';
import noteController from '../controllers/note.controller.js';
import validate from '../middlewares/validate.js';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js';

const router = Router();

router.get('/', noteController.getAll);
router.get('/:id', noteController.getById);
router.post('/', validate(createNoteSchema), noteController.create);
router.put('/:id', validate(updateNoteSchema), noteController.update);
router.delete('/:id', noteController.remove);

export default router;
