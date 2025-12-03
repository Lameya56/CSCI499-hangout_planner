import * as ExploreModel from '../models/exploreModel.js';
import { pool } from "../config/database.js";
// Get all public posts
// UPDATE getAllPosts to use search and filter
export const getAllPosts = async (req, res) => {
  try {
    const { search, sortBy, limit, offset } = req.query;
    
    const posts = await ExploreModel.searchAndFilterPosts({
      search,
      sortBy,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    });
    
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};


// Get single post
// UPDATE getPostById to include likes and comments
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional - user might not be logged in
    
    const post = await ExploreModel.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get comments
    const comments = await ExploreModel.getPostComments(id);
    
    // Check if current user liked this post
    let hasLiked = false;
    if (userId) {
      hasLiked = await ExploreModel.hasUserLikedPost(id, userId);
    }
    
    res.status(200).json({ 
      post,
      comments,
      hasLiked
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};


// Get user's own posts
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await ExploreModel.getUserPosts(userId);
    
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const { plan_id, title, content, image_url, location, tags, is_public } = req.body;
    const userId = req.user.id;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    console.log('📝 Creating post:', { title, userId });
    
    const post = await ExploreModel.createPost({
      user_id: userId,
      plan_id,
      title,
      content,
      image_url,
      location,
      tags: tags || [],
      is_public: is_public !== undefined ? is_public : true
    });
    
    console.log('✅ Post created:', post.id);
    
    res.status(201).json({ 
      message: 'Post created successfully!',
      post 
    });
  } catch (err) {
    console.error('❌ Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    
    // Check ownership
    const isOwner = await ExploreModel.isPostOwner(id, userId);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    
    console.log('✏️ Updating post:', id);
    
    const updatedPost = await ExploreModel.updatePost(id, updates);
    
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log('✅ Post updated:', id);
    
    res.status(200).json({ 
      message: 'Post updated successfully!',
      post: updatedPost 
    });
  } catch (err) {
    console.error('❌ Error updating post:', err);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check ownership
    const isOwner = await ExploreModel.isPostOwner(id, userId);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    
    console.log('🗑️ Deleting post:', id);
    
    const deletedPost = await ExploreModel.deletePost(id);
    
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log('✅ Post deleted:', id);
    
    res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error('❌ Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// LIKES
// ============================================

// Like a post
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('👍 User', userId, 'liking post', id);
    
    await ExploreModel.likePost(id, userId);
    
    res.status(200).json({ message: 'Post liked!' });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('👎 User', userId, 'unliking post', id);
    
    await ExploreModel.unlikePost(id, userId);
    
    res.status(200).json({ message: 'Post unliked!' });
  } catch (err) {
    console.error('Error unliking post:', err);
    res.status(500).json({ message: 'Failed to unlike post' });
  }
};

// Get post likes
export const getPostLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const likes = await ExploreModel.getPostLikes(id);
    
    res.status(200).json({ likes });
  } catch (err) {
    console.error('Error fetching likes:', err);
    res.status(500).json({ message: 'Failed to fetch likes' });
  }
};

// COMMENTS
// ============================================

// Add comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
    
    console.log('💬 User', userId, 'commenting on post', id);
    
    const newComment = await ExploreModel.addComment(id, userId, comment);
    
    // Get user name for response
    const user = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    newComment.user_name = user.rows[0].name;
    
    res.status(201).json({ 
      message: 'Comment added!',
      comment: newComment
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    console.log('🗑️ User', userId, 'deleting comment', commentId);
    
    await ExploreModel.deleteComment(commentId, userId);
    
    res.status(200).json({ message: 'Comment deleted!' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
    
    console.log('✏️ User', userId, 'updating comment', commentId);
    
    const updatedComment = await ExploreModel.updateComment(commentId, userId, comment);
    
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }
    
    res.status(200).json({ 
      message: 'Comment updated!',
      comment: updatedComment
    });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};