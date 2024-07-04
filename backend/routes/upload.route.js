import express from 'express';
import { getAllImages, upload ,getMonthlyData,getCountryStats} from '../controllers/image.controller.js';

const router = express.Router();

router.get('/monthly-data',getMonthlyData);
router.post('/user', upload);
router.get('/all-images', getAllImages);
router.get('/country-stats',getCountryStats);

export default router;
