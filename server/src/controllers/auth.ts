import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const register = async (req: Request, res: Response) => {
  try {
    const { username, fullName, email, password } = req.body;
    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, fullName, email, password: hashedPassword },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to NoteJob!',
      html: `<h1>Welcome ${fullName}!</h1><p>Your account has been created successfully.</p>`,
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body; // email field can contain either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });

    const expiresIn = rememberMe ? '30d' : '1d';
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  // This is a mock response, ideally we would create a reset token.
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `<p>Click here to reset your password...</p>`,
  });
  res.json({ message: 'Recovery email sent' });
};
