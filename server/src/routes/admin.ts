import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getUsers, updateUserRole, deleteUser } from '../controllers/admin';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const router = Router();
router.use(requireAuth);

const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user?.role !== 'ADMIN') return res.status(403).json({ error: 'Quyền truy cập bị từ chối!' });
    next();
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xác thực Admin' });
  }
};

router.use(requireAdmin);

router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
