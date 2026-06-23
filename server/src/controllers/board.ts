import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getBoardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const projectId = req.query.projectId as string | undefined;
    
    // Auto-create a default project if user has none
    const existingProjectsCount = await prisma.project.count({ where: { userId } });
    if (existingProjectsCount === 0) {
      await prisma.project.create({
        data: {
          name: 'Không gian làm việc đầu tiên',
          userId,
          lists: {
            create: [
              { title: 'Cần làm', order: 0 },
              { title: 'Đang làm', order: 1 },
              { title: 'Đã xong', order: 2 }
            ]
          }
        }
      });
    }

    const allProjects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    let currentProject;
    if (projectId) {
      currentProject = await prisma.project.findFirst({
        where: { id: projectId, userId },
        include: {
          lists: {
            orderBy: { order: 'asc' },
            include: { tasks: { orderBy: { order: 'asc' } } }
          }
        }
      });
    }

    if (!currentProject) {
      currentProject = await prisma.project.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: {
          lists: {
            orderBy: { order: 'asc' },
            include: { tasks: { orderBy: { order: 'asc' } } }
          }
        }
      });
    }

    res.json({ currentProject, allProjects });
  } catch (error) {
    console.error('getBoardData Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name } = req.body;
    
    const project = await prisma.project.create({
      data: {
        name,
        userId,
        lists: {
          create: [
            { title: 'Cần làm', order: 0 },
            { title: 'Đang làm', order: 1 },
            { title: 'Đã xong', order: 2 }
          ]
        }
      }
    });
    
    res.json(project);
  } catch (error) {
    console.error('createProject Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { listId, content } = req.body;
    const tasksCount = await prisma.task.count({ where: { listId } });
    
    const task = await prisma.task.create({
      data: {
        content,
        listId,
        order: tasksCount
      }
    });
    
    res.json(task);
  } catch (error) {
    console.error('createTask Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const moveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, sourceListId, destListId, sourceIndex, destIndex } = req.body;
    
    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: { listId: destListId, order: -1 }
      });

      await tx.task.updateMany({
        where: { listId: sourceListId, order: { gt: sourceIndex } },
        data: { order: { decrement: 1 } }
      });

      await tx.task.updateMany({
        where: { listId: destListId, order: { gte: destIndex } },
        data: { order: { increment: 1 } }
      });

      await tx.task.update({
        where: { id: taskId },
        data: { order: destIndex }
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('moveTask Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createList = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, title } = req.body;
    const listsCount = await prisma.list.count({ where: { projectId } });
    const list = await prisma.list.create({
      data: { projectId, title, order: listsCount },
      include: { tasks: true }
    });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteList = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.list.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await prisma.project.update({ where: { id }, data: { name } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, identifier } = req.body;
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [ { email: identifier }, { username: identifier } ]
      }
    });

    if (!targetUser) return res.status(404).json({ error: 'Không tìm thấy người dùng!' });
    if (targetUser.id === req.userId) return res.status(400).json({ error: 'Không thể tự mời bản thân!' });

    const existingMember = await prisma.projectMember.findFirst({
      where: { projectId, userId: targetUser.id }
    });
    if (existingMember) return res.status(400).json({ error: 'Người dùng đã trong dự án hoặc đã có lời mời!' });

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        status: 'PENDING'
      }
    });
    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjectMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, username: true, fullName: true, avatar: true } } }
    });
    // Include owner
    const project = await prisma.project.findUnique({ where: { id }, include: { user: { select: { id: true, username: true, fullName: true, avatar: true } } } });
    res.json({ owner: project?.user, members });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, memberId } = req.params; // project id, member id
    const project = await prisma.project.findUnique({ where: { id } });
    if (project?.userId !== req.userId) return res.status(403).json({ error: 'Chỉ chủ sở hữu mới có quyền xóa!' });

    await prisma.projectMember.deleteMany({
      where: { projectId: id, userId: memberId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
