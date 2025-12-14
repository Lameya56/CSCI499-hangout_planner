import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockBoards } from "@/data/mockMemories";

const MemoryBoard = () => {
  const { id } = useParams();
//   const [pins, setPins] = useState(mockPins);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newImage, setNewImage] = useState(null);
  const location = useLocation();
  const title = location.state?.title || "Memory Board";
  const [pins, setPins] = useState(location.state?.pins || []);
  const board = mockBoards.find(b => b.id === Number(id));

  const addPin = () => {
    if (!newImage && !newNote) return;

    const pin = {
      id: Date.now(),
      type: newImage ? "image" : "note",
      content: newImage || newNote
    };

    setPins([pin, ...pins]);
    setShowModal(false);
    setNewImage(null);
    setNewNote("");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>

        <Button
          onClick={() => setShowModal(true)}
          className="rounded-full"
        >
          + Add
        </Button>
      </div>

      {/* Pinterest-style masonry */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-1">
        {pins.map((pin) => (
          <div key={pin.id} className="break-inside-avoid mb-1">
            {pin.type === "image" ? (
              <img
                src={pin.content}
                alt=""
                className="w-full rounded-lg"
              />
            ) : (
              <div className="bg-[#fdf7f2] p-3 rounded-lg text-sm leading-snug shadow-inner font-handwriting">
                {pin.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Pin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 relative">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold">Add New Pin</h2>

            <div>
            <input
                type="file"
                accept="image/*"
                id="upload-image"
                className="hidden"
                onChange={(e) =>
                setNewImage(URL.createObjectURL(e.target.files[0]))
                }
            />

            <label
                htmlFor="upload-image"
                className="inline-flex items-center justify-center w-full px-4 py-3 
                        rounded-full bg-black text-white font-medium 
                        cursor-pointer hover:scale-105 transition"
            >
                📸 Upload a photo
            </label>

            {/* Preview */}
            {newImage && (
                <img
                src={newImage}
                alt="preview"
                className="mt-3 rounded-lg max-h-40 object-cover w-full"
                />
            )}
            </div>


            <textarea
              placeholder="Or write a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full min-h-[120px] border rounded-xl p-3 resize-none"
            />

            <Button
              onClick={addPin}
              className="w-full rounded-full"
            >
              Add Pin
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryBoard;
