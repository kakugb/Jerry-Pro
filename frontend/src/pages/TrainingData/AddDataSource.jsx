import React, { useState } from 'react';
import axiosInstance from "../../api/axiosInstance.js";
import { useNavigate } from 'react-router-dom';

const AddDataSource = () => {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleYoutubeChange = (e) => {
    setYoutubeUrl(e.target.value);
    setSelectedFile(null);
    setFileContent(null);
  };

  // Handle file validation and processing
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      setFileContent(null);
      setYoutubeUrl('');
      return;
    }

    const allowedFormats = ["csv", "txt", "json", "doc", "xlsx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedFormats.includes(fileExtension)) {
      alert("Invalid file format! Allowed formats: CSV, TXT, JSON, DOC, XLSX.");
      e.target.value = null;
      return;
    }

    if (fileExtension === "json") {
      try {
        const content = await readFileContent(file);
        const parsedContent = JSON.parse(content);

        if (!validateJsonFormat(parsedContent)) {
          alert("Invalid JSON format. Please provide data in the required format.");
          e.target.value = null;
          return;
        }

        setSelectedFile(file);
        setFileContent(parsedContent);
        setYoutubeUrl('');
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert("Invalid JSON file. Please check the content.");
        e.target.value = null;
      }
    } else {
      setSelectedFile(file);
      setYoutubeUrl('');
    }
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!youtubeUrl && !selectedFile) {
      alert("Please provide either a YouTube URL or a file.");
      return;
    }

    setIsLoading(true);
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

    try {
      await axiosInstance.post("/addDataSource", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Data source added successfully!");
      navigate('/training-data');
    } catch (error) {
      console.error("Error adding data source:", error);
      alert("Failed to add data source. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] relative overflow-hidden p-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl mb-6">Training Data</h1>
        
        <div className="flex gap-4 mb-6">
          <button className="bg-[#1a237e] text-white px-6 py-2 rounded">
            Datasources
          </button>
          <button className="text-gray-700 px-6 py-2 hover:bg-gray-50">
            Settings
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl mb-6">Add a Datasource</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="text"
                placeholder="Paste YouTube video URL"
                value={youtubeUrl}
                onChange={handleYoutubeChange}
                disabled={!!selectedFile}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#1a237e] disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={!!youtubeUrl}
                  accept=".csv,.txt,.json,.doc,.xlsx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`px-4 py-2 border rounded cursor-pointer ${
                    youtubeUrl ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Choose File
                </label>
                <span className="ml-3 text-gray-600">
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Allowed formats: CSV, TXT, JSON, DOC, XLSX
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                className="bg-[#1a237e] text-white px-6 py-2 rounded hover:bg-[#151b60]"
                disabled={(!youtubeUrl && !selectedFile) || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Adding...' : 'Add'}
              </button>
              <button 
                className="px-6 py-2 rounded border hover:bg-gray-50"
                onClick={() => navigate('/training-data')}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDataSource;