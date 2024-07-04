import express from 'express';
import {updateUser,checkAuthAndGetUser} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/userdetails',checkAuthAndGetUser);
router.put('/update/:id', updateUser);


export default router;
