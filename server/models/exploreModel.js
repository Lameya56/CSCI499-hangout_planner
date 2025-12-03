import { pool } from "../config/database.js";

// Get all public posts (for explore feed)
export const getAllPublicPosts = async (limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT ep.*, u.name as author_name, u.email as author_email
     FROM explore_posts ep
     JOIN users u ON ep.user_id = u.id
     WHERE ep.is_public = true
     ORDER BY ep.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  return result.rows;
};

// Get single post by ID
export const getPostById = async (postId) => {
  const result = await pool.query(
    `SELECT ep.*, u.name as author_name, u.email as author_email
     FROM explore_posts ep
     JOIN users u ON ep.user_id = u.id
     WHERE ep.id = $1`,
    [postId]
  );
  
  return result.rows[0];
};

// Get user's own posts
export const getUserPosts = async (userId) => {
  const result = await pool.query(
    `SELECT ep.*, u.name as author_name
     FROM explore_posts ep
     JOIN users u ON ep.user_id = u.id
     WHERE ep.user_id = $1
     ORDER BY ep.created_at DESC`,
    [userId]
  );
  
  return result.rows;
};

// Create new post
export const createPost = async (postData) => {
  const { user_id, plan_id, title, content, image_url, location, tags, is_public } = postData;
  
  const result = await pool.query(
    `INSERT INTO explore_posts (user_id, plan_id, title, content, image_url, location, tags, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user_id, plan_id || null, title, content, image_url, location, tags, is_public]
  );
  
  return result.rows[0];
};

// Update post
export const updatePost = async (postId, postData) => {
  const { title, content, image_url, location, tags, is_public } = postData;
  
  const result = await pool.query(
    `UPDATE explore_posts
     SET title = COALESCE($1, title),
         content = COALESCE($2, content),
         image_url = COALESCE($3, image_url),
         location = COALESCE($4, location),
         tags = COALESCE($5, tags),
         is_public = COALESCE($6, is_public)
     WHERE id = $7
     RETURNING *`,
    [title, content, image_url, location, tags, is_public, postId]
  );
  
  return result.rows[0];
};

// Delete post
export const deletePost = async (postId) => {
  const result = await pool.query(
    'DELETE FROM explore_posts WHERE id = $1 RETURNING *',
    [postId]
  );
  
  return result.rows[0];
};

// Check if user owns post
export const isPostOwner = async (postId, userId) => {
  const result = await pool.query(
    'SELECT user_id FROM explore_posts WHERE id = $1',
    [postId]
  );
  
  return result.rows[0]?.user_id === userId;
};


// LIKES
// ============================================

// Check if user liked a post
export const hasUserLikedPost = async (postId, userId) => {
  const result = await pool.query(
    'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );
  
  return result.rows.length > 0;
};

// Like a post
export const likePost = async (postId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert like
    await client.query(
      'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [postId, userId]
    );
    
    // Increment likes count
    await client.query(
      'UPDATE explore_posts SET likes_count = likes_count + 1 WHERE id = $1',
      [postId]
    );
    
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Unlike a post
export const unlikePost = async (postId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Delete like
    const result = await client.query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2 RETURNING *',
      [postId, userId]
    );
    
    // Decrement likes count if like existed
    if (result.rows.length > 0) {
      await client.query(
        'UPDATE explore_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
        [postId]
      );
    }
    
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Get post likes with user info
export const getPostLikes = async (postId) => {
  const result = await pool.query(
    `SELECT pl.*, u.name as user_name
     FROM post_likes pl
     JOIN users u ON pl.user_id = u.id
     WHERE pl.post_id = $1
     ORDER BY pl.created_at DESC`,
    [postId]
  );
  
  return result.rows;
};

// COMMENTS
// ============================================

// Get comments for a post
export const getPostComments = async (postId) => {
  const result = await pool.query(
    `SELECT pc.*, u.name as user_name
     FROM post_comments pc
     JOIN users u ON pc.user_id = u.id
     WHERE pc.post_id = $1
     ORDER BY pc.created_at DESC`,
    [postId]
  );
  
  return result.rows;
};

// Add comment
export const addComment = async (postId, userId, comment) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert comment
    const result = await client.query(
      `INSERT INTO post_comments (post_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, userId, comment]
    );
    
    // Increment comments count
    await client.query(
      'UPDATE explore_posts SET comments_count = comments_count + 1 WHERE id = $1',
      [postId]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Delete comment
export const deleteComment = async (commentId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get comment to find post_id
    const comment = await client.query(
      'SELECT post_id FROM post_comments WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    );
    
    if (comment.rows.length === 0) {
      throw new Error('Comment not found or unauthorized');
    }
    
    const postId = comment.rows[0].post_id;
    
    // Delete comment
    await client.query(
      'DELETE FROM post_comments WHERE id = $1',
      [commentId]
    );
    
    // Decrement comments count
    await client.query(
      'UPDATE explore_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1',
      [postId]
    );
    
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Update comment
export const updateComment = async (commentId, userId, newComment) => {
  const result = await pool.query(
    `UPDATE post_comments
     SET comment = $1
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [newComment, commentId, userId]
  );
  
  return result.rows[0];
};

// SEARCH & FILTER
// ============================================

// Search and filter posts
export const searchAndFilterPosts = async (filters) => {
  const { search, sortBy, limit = 50, offset = 0 } = filters;
  
  let query = `
    SELECT ep.*, u.name as author_name, u.email as author_email
    FROM explore_posts ep
    JOIN users u ON ep.user_id = u.id
    WHERE ep.is_public = true
  `;
  
  const params = [];
  let paramCount = 1;
  
  // Add search filter
  if (search && search.trim()) {
    query += ` AND (
      ep.title ILIKE $${paramCount} OR 
      ep.content ILIKE $${paramCount} OR 
      ep.location ILIKE $${paramCount} OR
      EXISTS (
        SELECT 1 FROM unnest(ep.tags) AS tag 
        WHERE tag ILIKE $${paramCount}
      )
    )`;
    params.push(`%${search}%`);
    paramCount++;
  }
  
  // Add sorting
  if (sortBy === 'likes') {
    query += ' ORDER BY ep.likes_count DESC, ep.created_at DESC';
  } else if (sortBy === 'comments') {
    query += ' ORDER BY ep.comments_count DESC, ep.created_at DESC';
  } else if (sortBy === 'oldest') {
    query += ' ORDER BY ep.created_at ASC';
  } else {
    // Default: newest first
    query += ' ORDER BY ep.created_at DESC';
  }
  
  // Add pagination
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  return result.rows;
};