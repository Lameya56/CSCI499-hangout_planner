import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ExploreCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    location: '',
    tags: '',
    is_public: true
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Convert tags string to array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const postData = {
        ...formData,
        tags: tagsArray
      };

      console.log('📤 Creating post:', postData);

      const res = await fetch('/api/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Story shared successfully! 🎉');
        navigate(`/explore/${data.post.id}`);
      } else {
        alert(data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('❌ Error creating post:', err);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Share Your Hangout Story 🌟</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Epic Beach Day with Friends"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Story *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tell us about your awesome hangout..."
                rows={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Santa Monica Beach, CA"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="beach, friends, summer"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="is_public">Make this story public</Label>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/explore')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Sharing...' : 'Share Story'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ExploreCreate;