import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./trainingscroll.css";
const TrainingData = () => {
  const [activeTab, setActiveTab] = useState("datasources");
  const [dataSources, setDataSources] = useState([]);

  const fetchDataSources = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/datasources");
      const filteredData = response.data.data.map(
        ({ id, name, type, size }) => ({
          id,
          name,
          type,
          size,
        })
      );
      setDataSources(filteredData);
    } catch (error) {
      console.error("Error fetching data sources:", error);
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] relative overflow-hidden">
      <div className="bg-white rounded-lg p-6">
        <h1 className="text-2xl mb-6">Training Data</h1>

        <div className="flex gap-4 bg-[#61CBC8] py-4 px-2 rounded-t-xl">
          <button
            className={`${
              activeTab === "datasources"
                ? "bg-[#224289] text-white"
                : "text-gray-700 hover:bg-gray-50"
            } px-6 py-2 rounded-3xl`}
            onClick={() => setActiveTab("datasources")}
          >
            Datasources
          </button>
          <button
            className={`${
              activeTab === "settings"
                ? "bg-[#224289] text-white"
                : "text-white bg-[#224289]"
            } px-6 py-2 rounded-3xl`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <div className="flex-1 flex justify-end">
            <Link to="/add-datasource">
              <button className="bg-[#224289] text-white px-4 py-2 rounded-3xl flex items-center gap-2 cursor-pointer">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Add Datasource
              </button>
            </Link>
          </div>
        </div>

        {activeTab === "datasources" && (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrolbar-t">
              <table className="w-full">
                <thead className="bg-[#E5F3F3] sticky top-0">
                  <tr>
                    <th className="py-4 px-6 text-left font-bold  border-r border-black">
                      NAME
                    </th>
                    <th className="py-4 px-6 text-left font-bold  border-r border-black">
                      TYPE
                    </th>
                    <th className="py-4 px-6 text-left font-bold  ">SIZE</th>
                  </tr>
                </thead>
                <tbody>
                  {dataSources.map((source, index) => (
                    <tr
                      key={source.id}
                      className={`text-black border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-[#E5F3F3]/30" : "bg-white"
                      }`}
                    >
                      <td className="py-4 px-6 text-left border-r border-black ">
                        {source.name}
                      </td>
                      <td className="py-4 px-6 text-left border-r border-black">
                        {source.type}
                      </td>
                      <td className="py-4 px-6 text-left ">{source.size}</td>
                    </tr>
                  ))}
                  {dataSources.length === 0 && (
                    <tr className="text-black">
                      <td
                        colSpan="3"
                        className="py-4 px-6 text-center text-gray-500"
                      >
                        No data sources available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-4">
            <h2 className="text-xl mb-4">Settings</h2>
            <p className="text-gray-600">
              Manage settings for the training data interface here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingData;
