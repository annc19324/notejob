import { Router } from 'express';
import { uploadAvatar, updateProfile } from '../controllers/user';
import { requireAuth } from '../middleware/auth';
import { upload } from '../utils/cloudinary';

const router = Router();

router.use(requireAuth);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/profile', updateProfile);

export default router;
