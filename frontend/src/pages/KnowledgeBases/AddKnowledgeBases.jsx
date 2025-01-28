import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useNavigate } from "react-router-dom";

const AddKnowledgeBases = () => { 
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  // Handle file validation and processing
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      setFileContent(null);
      return;
    }

    const allowedFormats = ["csv", "txt", "json", "doc", "xlsx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedFormats.includes(fileExtension)) {
      alert("Invalid file format! Allowed formats: CSV, TXT, JSON, DOC, XLSX.");
      event.target.value = null;
      return;
    }

    if (fileExtension === "json") {
      try {
        const content = await readFileContent(file);
        const parsedContent = JSON.parse(content);

        if (!validateJsonFormat(parsedContent)) {
          alert(
            "Invalid JSON format. Please provide data in the required format."
          );
          event.target.value = null;
          return;
        }

        setFileContent(parsedContent);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert("Invalid JSON file. Please check the content.");
        event.target.value = null;
        return;
      }
    }

    setSelectedFile(file);
  };

  // Read file content as text
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // Validate JSON format
  const validateJsonFormat = (json) => {
    if (!json.data || !Array.isArray(json.data)) {
      return false;
    }

    return json.data.every((item) => {
      return (
        item.text &&
        typeof item.text === "string" &&
        item.reference &&
        typeof item.reference === "string"
      );
    });
  };

  const handleYoutubeUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      alert("Please provide a title and description for the knowledge base.");
      return;
    }

    if (!youtubeUrl && !selectedFile) {
      alert("Please provide at least one datasource!");
      return;
    }

    try {
      // First create the knowledge base
      const kbResponse = await axiosInstance.post(
        "/knowledgeBases",
        {
          title,
          description,
          isActive: false,
        }
      );

      const formData = new FormData();

      if (selectedFile) {
        formData.append("file", selectedFile);
        if (fileContent) {
          formData.append("content", JSON.stringify(fileContent));
        }
      }

      if (youtubeUrl) {
        formData.append("type", "youtube");
        formData.append("youtubeUrl", youtubeUrl);
      }

      await axiosInstance.post("/addDataSource", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Knowledge base added successfully!");
      navigate("/knowledge-bases");
    } catch (error) {
      console.error("Error adding knowledge base:", error);
      alert("Failed to add knowledge base.");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setSelectedFile(null);
    setFileContent(null);
    navigate("/knowledge-bases"); 
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white  rounded-lg mt-4 h-[calc(100vh-150px)] relative overflow-hidden ">
     
      <h1 className="text-2xl font-semibold mb-4">Add Knowledge Base</h1>

      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Title
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          rows="4"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      <h2 className="text-xl font-semibold mb-4">Add a Datasource</h2>

      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          YouTube URL
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={youtubeUrl}
          onChange={handleYoutubeUrlChange}
          disabled={!!selectedFile}
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Upload File
        </label>
        <input
          type="file"
          accept=".csv,.txt,.json,.doc,.xlsx"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleFileChange}
          disabled={!!youtubeUrl}
        />
        <p className="text-sm text-gray-500 mt-1">
          {selectedFile ? selectedFile.name : "No file chosen"}
        </p>
        <p className="text-xs text-gray-400">
          Allowed formats: CSV, TXT, JSON, DOC, XLSX
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          className="px-5 py-2 bg-gray-600 text-white rounded-md"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-[#224289] text-white rounded-md"
          onClick={handleSubmit}
        >
          Add Knowledge Base
        </button>
      </div>
    </div>
  );
};

export default AddKnowledgeBases;
