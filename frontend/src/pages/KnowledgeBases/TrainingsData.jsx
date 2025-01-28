import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useNavigate } from "react-router-dom";

const TrainingsData = () => {
  const navigate = useNavigate();
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKnowledgeBases = async () => {
    try {
      const response = await axiosInstance.get("/knowledgeBases");
      setKnowledgeBases(response.data.data);
    } catch (error) {
      console.error("Error fetching knowledge bases:", error);
      alert("Failed to fetch knowledge bases.");
    }
  };

  const fetchDataSources = async () => {
    try {
      const response = await axiosInstance.get("/dataSources");
      setDataSources(response.data.data);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      alert("Failed to fetch data sources.");
    }
  };

  const handleSubmit = async () => {
    if (!knowledgeBase || !dataSource) {
      alert("Please select both a knowledge base and a data source.");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/trainKnowledgeBase", {
        knowledgeBaseId: parseInt(knowledgeBase),
        dataSourceIds: [parseInt(dataSource)],
      });
      alert("Training started successfully!");
      navigate("/knowledge-bases");
    } catch (error) {
      console.error("Error starting training:", error);
      alert("Failed to start training.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setKnowledgeBase("");
    setDataSource("");
    navigate("/knowledge-bases");
  };

  useEffect(() => {
    fetchKnowledgeBases();
    fetchDataSources();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 border border-gray-200">
      <h1 className="text-2xl font-semibold text-[#1a237e] mb-6">
        Select Knowledge Base for Training
      </h1>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select a Knowledge Base
        </label>
        <select
          value={knowledgeBase}
          onChange={(e) => setKnowledgeBase(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Choose an option
          </option>
          {knowledgeBases.map((kb) => (
            <option key={kb.id} value={kb.id}>
              {kb.title}{" "}
              {/* Changed from kb.name to kb.title to match API data */}
            </option>
          ))}
        </select>
      </div>

      <h1 className="text-2xl font-semibold text-[#1a237e] mb-6">
        Select Data Source for Training
      </h1>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select a Data Source
        </label>
        <select
          value={dataSource}
          onChange={(e) => setDataSource(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Choose an option
          </option>
          {dataSources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name} ({ds.type}) {/* Added type information */}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleCancel}
          className="px-5 py-2 bg-gray-600 text-white rounded-md"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#224289] text-white rounded-md"
          disabled={isLoading}
        >
          {isLoading ? "Starting Training..." : "Start Training"}
        </button>
      </div>
    </div>
  );
};

export default TrainingsData;
