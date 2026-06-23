import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { searchUsers, getNotifications, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, acceptProjectInvite, rejectProjectInvite, getFriends, getMessages, sendMessage } from '../controllers/social';

const router = Router();
router.use(requireAuth);

router.get('/users/search', searchUsers);
router.get('/notifications', getNotifications);
router.post('/friends/request', sendFriendRequest);
router.post('/friends/accept', acceptFriendRequest);
router.post('/friends/reject', rejectFriendRequest);
router.post('/projects/accept-invite', acceptProjectInvite);
router.post('/projects/reject-invite', rejectProjectInvite);
router.get('/friends', getFriends);
router.get('/messages/:friendId', getMessages);
router.post('/messages', sendMessage);

export default router;
