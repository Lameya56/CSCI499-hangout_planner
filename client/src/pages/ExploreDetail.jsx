import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchPost();
  }, [id]);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/explore/${id}`, { headers });
      const data = await res.json();

      if (res.ok) {
        setPost(data.post);
        setComments(data.comments || []);
        setHasLiked(data.hasLiked || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like posts');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = `/api/explore/${id}/like`;
      const method = hasLiked ? 'DELETE' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setHasLiked(!hasLiked);
        setPost(prev => ({
          ...prev,
          likes_count: hasLiked ? prev.likes_count - 1 : prev.likes_count + 1
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to comment');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingComment(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/explore/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment })
      });

      const data = await res.json();

      if (res.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
        setPost(prev => ({
          ...prev,
          comments_count: prev.comments_count + 1
        }));
      } else {
        alert(data.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/explore/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        setPost(prev => ({
          ...prev,
          comments_count: Math.max(0, prev.comments_count - 1)
        }));
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/explore/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Story deleted successfully!');
        navigate('/explore');
      } else {
        alert('Failed to delete story');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete story');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  const isOwner = user && post.user_id === user.id;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
             <Button 
              variant="outline" 
              onClick={() => navigate('/explore')}
              className="mt-6"
            >
              ← Back to Explore
            </Button>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
              <p className="text-sm text-gray-500">
                By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
              </p>
              {post.location && (
                <p className="text-sm text-gray-600 mt-1">📍 {post.location}</p>
              )}

             
            </div>
           
            {isOwner && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/explore/${id}/edit`)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt="post"
              className="w-full h-80 object-cover rounded-lg mb-4"
            />
          )}
  
          <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

           {/* Stats */}
          <div className="flex items-center gap-4 mt-3 mb-4">
            <button onClick={handleLike} className="flex items-center gap-1 text-gray-700">
              <Heart size={20} className={hasLiked ? "fill-red-500 text-red-500" : ""} />
              <span>{post.likes_count} likes</span>
            </button>

            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle size={20} />
              <span>{post.comments_count} comments</span>
            </div>
          </div>

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="mb-6">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button type="submit" disabled={submittingComment} className="mt-2 flex items-center gap-2">
              <Send size={16} />
              Post Comment
            </Button>
          </form>

          {/* Comments List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border p-3 mb-3 rounded-lg flex justify-between"
              >
                <div>
                  <p className="font-semibold">{comment.author_name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                  <p className="mt-1">{comment.comment}</p>
                </div>

                {user && comment.user_id === user.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default ExploreDetail;
