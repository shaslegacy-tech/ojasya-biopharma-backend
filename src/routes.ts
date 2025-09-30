import { Router } from 'express';
import { testRoute } from './controller';

const router = Router();

router.get('/test', testRoute);

export { router };
