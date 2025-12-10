import express from 'express';
import { 
  getAllPosts, 
  getPostById, 
  getMyPosts,
  createPost, 
  updatePost, 
  deletePost,
  likePost,
  unlikePost,
  getPostLikes,
  addComment,
  deleteComment,
  updateComment
} from '../controllers/exploreController.js';
import { authenticateJWT } from '../controllers/authMiddleware.js';

const router = express.Router();

// Public routes (anyone can view)
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes (requires authentication)
router.get('/my/posts', authenticateJWT, getMyPosts);
router.post('/', authenticateJWT, createPost);
router.put('/:id', authenticateJWT, updatePost);
router.delete('/:id', authenticateJWT, deletePost);

// Likes routes
router.post('/:id/like', authenticateJWT, likePost);
router.delete('/:id/like', authenticateJWT, unlikePost);
router.get('/:id/likes', getPostLikes);

// Comments routes
router.post('/:id/comments', authenticateJWT, addComment);
router.delete('/comments/:commentId', authenticateJWT, deleteComment);
router.put('/comments/:commentId', authenticateJWT, updateComment);

export default router;