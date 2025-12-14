import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { mockBoards } from "@/data/mockMemories";


const Memories = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Memories ✨</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBoards.map((board) => (
          <Card className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition group p-0 gap-0"
            key={board.id}
            onClick={() =>     
                navigate(`/memories/${board.id}`, {
                state: { title: board.title, pins: board.pins}
            })}
            
          >
            <img
              src={board.cover}
              alt=""
              className="w-full h-50 object-cover rounded-t-2xl"
            />
            <CardContent className="p-4">
              <h2 className="font-mono text-lg">{board.title}</h2>
              <p className="font-mono text-sm text-gray-500">{board.date}</p>
              <p className="font-monotext-sm text-gray-500 p-2">Tap to open board</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Memories;
