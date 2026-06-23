import { Router } from 'express';
import { getBoardData, createProject, updateProject, deleteProject, inviteMember, getProjectMembers, removeProjectMember, createTask, moveTask, createList, deleteList, deleteTask } from '../controllers/board';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getBoardData);
router.post('/project', createProject);
router.put('/project/:id', updateProject);
router.delete('/project/:id', deleteProject);
router.post('/project/invite', inviteMember);
router.get('/project/:id/members', getProjectMembers);
router.delete('/project/:id/members/:memberId', removeProjectMember);
router.post('/list', createList);
router.delete('/list/:id', deleteList);
router.post('/task', createTask);
router.delete('/task/:id', deleteTask);
router.put('/task/move', moveTask);

export default router;
