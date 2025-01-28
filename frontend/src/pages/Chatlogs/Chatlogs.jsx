import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import "./chatlogscroll.css";
const ChatLogs = () => {
  const [selectedChatbot, setSelectedChatbot] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [chatLogs, setChatLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const chatbots = [{ id: 1, name: "AI Code Academy Chatbot" }];

  const fetchSessionIds = async (chatbotId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/sessions?chatbotId=${chatbotId}&userId=${userId}`
      );
      setSessions(
        response.data.data.map((sessionId, index) => ({
          id: sessionId,
          name: `Session ${index + 1}`,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching session IDs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatLogs = async (sessionId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/sessionChatLogs?sessionId=${sessionId}`
      );

      const logs = response.data.data.flat() || [];
      const formattedLogs = logs
        .map((entry, index) => ({
          id: index + 1,
          text: entry.query,
          isUser: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          references: entry.references,
        }))
        .flatMap((query) => [
          query,
          {
            id: query.id + 0.5,
            text: logs[query.id - 1].response,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            references: query.references,
          },
        ]);

      setChatLogs(formattedLogs);
    } catch (error) {
      console.error("Error fetching chat logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatbotChange = (e) => {
    const chatbotId = e.target.value;
    setSelectedChatbot(chatbotId);
    setSelectedSession("");
    setChatLogs([]);
    if (chatbotId) {
      fetchSessionIds(chatbotId);
    }
  };

  // Handle session selection
  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    setSelectedSession(sessionId);
    if (sessionId) {
      fetchChatLogs(sessionId);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] relative overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-[#1a237e] mb-6">
          Chat Logs
        </h1>

        <div className="w-6xl space-y-6">
          <div className="flex justify-between gap-6 mx-auto">
            {/* Chatbot Selection */}
            <div className="flex items-center gap-4 min-w-[280px]">
              <label className="text-black font-medium min-w-[120px]">
                Select Chatbot
              </label>
              <div className="relative w-[250px]">
                <select
                  value={selectedChatbot}
                  onChange={handleChatbotChange}
                  className="w-full px-4 py-2.5 bg-[#224289] text-white text-md font-semibold border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="">Choose Chatbot</option>
                  {chatbots.map((chatbot) => (
                    <option key={chatbot.id} value={chatbot.id}>
                      {chatbot.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Session Selection */}
            <div className="flex items-center gap-4 min-w-[280px]">
              <label className="text-black font-medium min-w-[120px]">
                Select Session
              </label>
              <div className="relative w-[250px]">
                <select
                  value={selectedSession}
                  onChange={handleSessionChange}
                  className="w-full px-4 py-2.5 bg-[#224289] text-white text-md font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="">Choose Session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-black mt-6 mb-2 text-center">
            Conversations
          </h2>
        </div>

        <div className="bg-blue-50 rounded-lg mt-4 p-6 h-[calc(100vh-310px)] overflow-y-auto shadow-md shadow-gray-300 custom-scrolbar-c">
          {loading ? (
            <p className="text-center text-gray-500 mt-8">
              Loading conversations...
            </p>
          ) : !selectedChatbot || !selectedSession ? (
            <p className="text-center text-gray-600 mt-8 text-xl ">
              Please select a chatbot and session to view conversations
            </p>
          ) : chatLogs.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              No conversations found for this session
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {chatLogs.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col max-w-[70%] ${
                    message.isUser ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div
                    className={`relative p-4 rounded-lg shadow-sm ${
                      message.isUser
                        ? "bg-[#1a237e] text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p>{message.text}</p>
                    {/* <span className="text-xs text-gray-500 mt-1 block text-right">
                      {message.timestamp}
                    </span> */}

                    {!message.isUser &&
                      message.references &&
                      message.references.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-600">
                            References:
                          </p>
                          <ul className="text-sm text-gray-500">
                            {message.references.map((ref, idx) => (
                              <li key={idx}>
                                {typeof ref === "string"
                                  ? ref
                                  : JSON.stringify(ref)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <div
                      className={`absolute bottom-0 w-4 h-4 ${
                        message.isUser
                          ? "-right-2 bg-[#E3F2FD]"
                          : "-left-2 bg-white"
                      } transform rotate-45`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLogs;
