import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ],
        NOT: { id: req.userId }
      },
      select: { id: true, username: true, fullName: true, avatar: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const friendRequests = await prisma.friendship.findMany({
      where: { userId2: req.userId, status: 'PENDING' },
      include: {
        user1: { select: { id: true, username: true, fullName: true, avatar: true } }
      }
    });
    
    const projectInvites = await prisma.projectMember.findMany({
      where: { userId: req.userId, status: 'PENDING' },
      include: {
        project: { select: { id: true, name: true } }
      }
    });
    
    res.json({ friendRequests, projectInvites });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { targetId } = req.body;
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId1: req.userId, userId2: targetId },
          { userId1: targetId, userId2: req.userId }
        ]
      }
    });
    if (existing) return res.status(400).json({ error: 'Already requested or friends' });

    const reqs = await prisma.friendship.create({
      data: { userId1: req.userId!, userId2: targetId, status: 'PENDING' }
    });
    res.json(reqs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body; // friendship id
    await prisma.friendship.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const acceptProjectInvite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.projectMember.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.friendship.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const rejectProjectInvite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.projectMember.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId1: req.userId, status: 'ACCEPTED' },
          { userId2: req.userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        user1: { select: { id: true, username: true, fullName: true, avatar: true } },
        user2: { select: { id: true, username: true, fullName: true, avatar: true } }
      }
    });
    
    const friends = friendships.map(f => f.userId1 === req.userId ? f.user2 : f.user1);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { friendId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: friendId },
          { senderId: friendId, receiverId: req.userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    const message = await prisma.message.create({
      data: {
        senderId: req.userId!,
        receiverId,
        content
      }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
