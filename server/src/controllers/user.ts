import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const avatarUrl = req.file.path;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarUrl }
    });

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, username } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { fullName, username }
    });
    res.json({ user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, avatar: user.avatar } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
