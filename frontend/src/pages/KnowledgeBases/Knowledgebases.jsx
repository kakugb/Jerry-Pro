import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.js";
import "./Knowledgebases.css";
const Knowledgebases = () => {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [activeKnowledgeBaseId, setActiveKnowledgeBaseId] = useState(null);

  const fetchKnowledgeBases = async () => {
    try {
      const response = await axiosInstance.get("/knowledgeBases");
      setKnowledgeBases(response.data.data);
      const activeKB = response.data.data.find((kb) => kb.isActive);
      if (activeKB) {
        setActiveKnowledgeBaseId(activeKB.id);
      }
    } catch (error) {
      console.error("Error fetching knowledge bases:", error);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await axiosInstance.post("/knowledgeBases/setActive", {
        id,
      });
      setActiveKnowledgeBaseId(id);
      fetchKnowledgeBases();
    } catch (error) {
      console.error("Error setting active knowledge base:", error);
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] relative overflow-hidden">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Knowledge Base</h1>
      </div>

      <div className="flex justify-end gap-4 bg-[#61CBC8] py-4 px-2 rounded-t-xl">
        <Link to="/knowledge-trainingdata">
          <button className="px-8 py-2 bg-[#224289] text-white rounded-2xl hover:bg-[#234784] transition-colors cursor-pointer">
            Train Knowledge Base
          </button>
        </Link>
        <Link to="/add-newknowledge">
          <button className="px-8 py-2 bg-[#224289] text-white rounded-2xl hover:bg-[#234784] transition-colors flex items-center gap-2 cursor-pointer">
            <Plus className="w-5 h-5" />
            New Knowledge Base
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="min-w-full">
          <div
            className="overflow-y-auto custom-scrolbar-k h-[calc(100vh-105px)]"
           
          >
            <table className="min-w-full">
              <thead className="bg-[#E5F3F3] sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-r border-black w-42">
                    SR. #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-r border-black">
                    TITLE
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 w-42">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5F3F3]">
                {knowledgeBases.map((kb, index) => (
                  <tr
                    key={kb.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#E5F3F3]/30" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 border-r border-black">
                      {kb.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-r border-black">
                      {kb.title}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSetActive(kb.id)}
                        className={`px-5 py-2 rounded-full text-xs font-medium
            ${
              activeKnowledgeBaseId === kb.id
                ? "bg-[#61CBC8] text-[#2A5298]"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
                      >
                        {activeKnowledgeBaseId === kb.id
                          ? "ACTIVE"
                          : "SET ACTIVE"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knowledgebases;
