import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";

function App() {
  const [gratitude, setGratitude] = useState("");
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Fetch entries
  useEffect(() => {
    fetch("http://localhost:3001/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data.reverse()))
      .catch(console.error);
  }, []);

  const handleAdd = async () => {
    if (!gratitude.trim()) return;
    
    try {
      const res = await fetch("http://localhost:3001/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: gratitude }),
      });
      
      const savedEntry = await res.json();
      if (res.ok) {
        setEntries([savedEntry, ...entries]);
        setGratitude("");
      }
    } catch (err) {
      console.error("Failed to add entry:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/entries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setEntries(entries.filter((entry) => entry._id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingText.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText }),
      });

      const updated = await res.json();
      if (res.ok) {
        setEntries(entries.map((entry) => (entry._id === id ? updated : entry)));
        setEditingId(null);
        setEditingText("");
      }
    } catch (err) {
      console.error("Error updating:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-xl shadow-lg bg-white"
        >
          <div className="flex justify-center mb-6"> {/* Centered header */}
            <motion.h1 
              className="text-2xl font-bold flex items-center gap-2"
              whileHover={{ scale: 1.01 }}
            >
              <span className="text-3xl">🙏</span> 
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Gratitude Journal
              </span>
            </motion.h1>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="I'm grateful for..."
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <motion.button
              onClick={handleAdd}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-3 rounded-lg flex items-center gap-1 font-medium bg-blue-500 hover:bg-blue-600 text-white shadow-md"
            >
              <FiPlus className="text-lg" /> 
              <span className="hidden sm:inline">Add</span>
            </motion.button>
          </div>

          <ul className="space-y-3">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.li
                  key={entry._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="group rounded-lg transition-all bg-gray-100 hover:bg-gray-50 shadow-sm hover:shadow-md overflow-hidden"
                >
                  {editingId === entry._id ? (
                    <motion.div 
                      className="flex gap-2 p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                        className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <motion.button
                        onClick={() => handleUpdate(entry._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <FiCheck />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center gap-3"> {/* Centered content */}
                        <p className="text-lg break-words flex-1 text-gray-800">
                          {entry.text}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            onClick={() => {
                              setEditingId(entry._id);
                              setEditingText(entry.text);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-md text-blue-500 hover:bg-gray-200"
                          >
                            <FiEdit2 />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(entry._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-md text-red-500 hover:bg-gray-200"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </div>
                      {entry.createdAt && (
                        <p className="text-xs mt-1 text-gray-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default App;