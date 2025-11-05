import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { exploreData } from "../data/exploreData.js";

const Explore = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Explore Hangout Stories 🌟</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exploreData.map((post) => (
          <Link
            key={post.id}
            to={`/explore/${post.id}`}
            className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition"
          >
            <Card className="p-0">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-50 object-cover rounded-t-2xl"
                />
              )}
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
                <p className="text-sm text-gray-600 mt-1">By {post.author}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Explore;
