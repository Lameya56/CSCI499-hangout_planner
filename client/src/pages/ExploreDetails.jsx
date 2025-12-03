// import { useParams } from "react-router-dom";
// import { exploreData } from "../data/exploreData.js";
// import { Card, CardContent } from "@/components/ui/card";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";

// const ExploreDetails = () => {
//   const { id } = useParams();
//   const post = exploreData.find((p) => p.id === Number(id));
//   const [likes, setLikes] = useState(0);
//   const [comments, setComments] = useState([]);
//   const [input, setInput] = useState("");

//   if (!post) return <p>Post not found!</p>;

//   const handleComment = () => {
//     if (input.trim() !== "") {
//       setComments([...comments, input]);
//       setInput("");
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto">
//       {post.image && (
//         <img
//           src={post.image}
//           alt={post.title}
//           className="w-full h-64 object-cover rounded-2xl mb-6"
//         />
//       )}

//       <Card>
//         <CardContent className="p-6">
//           <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
//           <p className="text-gray-500 mb-4">By {post.author}</p>
//           <p className="text-gray-800 mb-6">{post.article}</p>

//           <div className="flex items-center gap-4 mb-4">
//             <Button onClick={() => setLikes(likes + 1)}>👍 Like ({likes})</Button>
//           </div>

//           <div>
//             <h2 className="text-lg font-semibold mb-2">Comments</h2>
//             <div className="space-y-2 mb-4">
//               {comments.map((c, i) => (
//                 <div key={i} className="bg-gray-100 p-2 rounded-md">{c}</div>
//               ))}
//             </div>
//             <div className="flex gap-2">
//               <input
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Add a comment..."
//                 className="flex-1 border p-2 rounded-md"
//               />
//               <Button onClick={handleComment}>Post</Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ExploreDetails;

