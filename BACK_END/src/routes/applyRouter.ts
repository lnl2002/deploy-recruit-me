import express from 'express';
import { ApplyController } from '~/controllers';

const router = express.Router();

router.get('/cvs/:jobId', ApplyController.getAllCVsByJobId);
router.get('/:id', ApplyController.getApplicationById);

router.post('/apply', ApplyController.applyToJob);

router.put('/status/:id', ApplyController.changeStatus);

router.delete('/:id', ApplyController.deleteApplication);