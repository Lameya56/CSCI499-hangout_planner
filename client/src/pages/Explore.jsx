// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Link, useNavigate } from "react-router-dom";

// const Explore = () => {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchPosts();
//   }, []);

//   const fetchPosts = async () => {
//     try {
//       console.log("📥 Fetching explore posts...");
//       const res = await fetch("/api/explore");
//       const data = await res.json();

//       if (res.ok) {
//         console.log("✅ Posts loaded:", data.posts.length);
//         setPosts(data.posts);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching posts:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <p>Loading stories...</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">Explore Hangout Stories</h1>
//         <Button onClick={() => navigate("/explore/create")}>
//           + Share Your Story
//         </Button>
//       </div>

//       {posts.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-500 mb-4">No stories yet. Be the first to share!</p>
//           <Button onClick={() => navigate("/explore/create")}>
//             Share Your Story
//           </Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {posts.map((post) => (
//             <Link
//               key={post.id}
//               to={`/explore/${post.id}`}
//               className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition"
//             >
//               <Card className="p-0">
//                 {post.image_url && (
//                   <img
//                     src={post.image_url}
//                     alt={post.title}
//                     className="w-full h-50 object-cover rounded-t-2xl"
//                   />
//                 )}
//                 <CardContent className="p-4">
//                   <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
//                   <p className="text-sm text-gray-600 mt-1">By {post.author_name}</p>
//                   <p className="text-sm text-gray-600 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
//                    {/* 👍 Likes count */}
//                   <p className="text-sm font-medium text-gray-800 mt-2">
//                     👍 {post.likes} likes
//                   </p>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Explore;
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle } from "lucide-react";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching explore posts...');
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('sortBy', sortBy);
      
      const res = await fetch(`/api/explore?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Posts loaded:', data.posts.length);
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading stories...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Search */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Explore Hangout Stories 🌟</h1>
          <Button onClick={() => navigate('/explore/create')}>
            + Share Your Story
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search stories, tags, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Comments</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {searchTerm && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Searching for:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {searchTerm}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTimeout(fetchPosts, 0);
                }}
                className="ml-2 text-blue-900 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No stories found matching your search.' : 'No stories yet. Be the first to share!'}
          </p>
          <Button onClick={() => navigate('/explore/create')}>
            Share Your Story
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/explore/${post.id}`}
              className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition"
            >
              <Card className="p-0 h-full">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-50 object-cover rounded-t-2xl"
                  />
                )}
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h2>
                  {post.location && (
                    <p className="text-xs text-gray-500 mb-2">📍 {post.location}</p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>{post.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      <span>{post.comments_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>By {post.author_name}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;