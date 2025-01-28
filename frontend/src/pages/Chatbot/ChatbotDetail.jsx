import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useParams } from "react-router-dom";
import "./scrollbar.css";
const ChatbotDetail = () => {
  const { id } = useParams();
  const [activeKnowledgeBase, setActiveKnowledgeBase] = useState(null);
  const [query, setQuery] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const chatLogRef = useRef(null);
  const inactivityTimeout = useRef(null);
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId.current);
  }, []);

  const fetchActiveKnowledgeBase = async () => {
    try {
      const response = await axiosInstance.get("/knowledgeBases/active");
      setActiveKnowledgeBase(response.data.data);
    } catch (error) {
      console.error("Error fetching active knowledge base:", error);
    }
  };

  const fetchChatLogs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!userId) {
        console.error("User ID is missing.");
        return;
      }

      const response = await axiosInstance.get(
        `/Chat_logs_new?userId=${userId}&chatbotId=${id}`
      );
      const filteredLogs =
        response.data.data?.filter((log) => log.query && log.response) || [];
      setChatLog(filteredLogs);
    } catch (error) {
      console.error("Error fetching chat logs:", error);
    }
  };

  const saveChatLog = async () => {
    if (chatLog.length > 0) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        if (!userId) {
          console.error("User details are missing.");
          return;
        }

        await axiosInstance.post("/Chat_logs_new", {
          userId,
          chatbotId: parseInt(id),
          sessionId: sessionId.current,
          chatLog: chatLog.filter((log) => log.query && log.response),
        });
        console.log("Chat log saved successfully.");
      } catch (error) {
        console.error("Error saving chat log:", error);
      }
    }
  };

  const handleInactivity = () => {
    console.log("User inactive for 5 minutes. Saving chat log...");
    saveChatLog();
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(handleInactivity, 5 * 60 * 1000);
  };

  const handleQuerySubmit = async () => {
    if (query.trim()) {
      const newLog = { query, response: "...", reference: null };
      setChatLog((prev) => [...prev, newLog]);
      setQuery("");

      try {
        const apiResponse = await axiosInstance.post("/chat", {
          query,
          index_number: parseInt(activeKnowledgeBase?.id),
        });

        const botResponse =
          apiResponse.data.translated_response ||
          apiResponse.data.response ||
          "No response available";
        const reference = apiResponse.data.reference || null;

        setChatLog((prev) =>
          prev.map((log, index) =>
            index === prev.length - 1
              ? { ...log, response: botResponse, reference }
              : log
          )
        );
      } catch (error) {
        console.error("Error communicating with the chatbot API:", error);
        setChatLog((prev) =>
          prev.map((log, index) =>
            index === prev.length - 1
              ? {
                  ...log,
                  response: "Sorry, something went wrong. Please try again.",
                  reference: null,
                }
              : log
          )
        );
      }
    }
  };

  useEffect(() => {
    fetchActiveKnowledgeBase();
    fetchChatLogs();
  }, []);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveChatLog();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [chatLog]);

  useEffect(() => {
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    resetInactivityTimer();
    return () => {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      clearTimeout(inactivityTimeout.current);
    };
  }, [chatLog]);

  return (
    <div className="overflow-hidden">
      <div className="flex-1 flex flex-col h-[calc(100vh-105px)] relative overflow-hidden">
        <div className="p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Chatbot Details</h2>
              {activeKnowledgeBase && (
                <div className="text-[20px] text-gray-600 mt-1 font-bold">
                  <div>Chat ID: {activeKnowledgeBase.id}</div>
                  <div>
                    Activated Knowledge Base: {activeKnowledgeBase.title}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button className="bg-[#224289] text-white px-14 py-2 rounded-xl flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
                Chat
              </button>
              <button className="bg-[#224289] text-white px-14 py-2 rounded-xl flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
                Settings
              </button>
              <button className="bg-[#224289] text-white px-14 py-2 rounded-xl flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z" />
                </svg>
                Deploy
              </button>
            </div>
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-10 space-y-6 bg-[#CEE7FE] mb-[80px] rounded-t-3xl rounded-b-3xl custom-scrolbar"
          ref={chatLogRef}
          style={{ 
            marginRight: '4px',  
            paddingRight: '6px'  
          }}
        >
          {chatLog.map((log, index) => (
            <div key={index}>
              {log.query && (
                <div className="flex justify-end">
                  <div className="bg-[#1a237e] text-white p-4 rounded-tl-lg rounded-tr-lg rounded-bl-lg">
                    <p>{log.query}</p>
                  </div>
                </div>  
              )}
              {log.response && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 max-w-[80%] shadow-sm rounded-br-lg rounded-tr-lg rounded-bl-lg">
                    <p>{log.response}</p>
                    {log.reference && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Reference: {log.reference.file}</p>
                        {log.reference.start_time !== undefined && (
                          <p>Start Time: {log.reference.start_time}s</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white mb-0">
          <div className="flex items-center bg-white rounded-lg border">
            <button className="p-2 hover:bg-gray-50">
              <svg
                className="w-6 h-6 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Query"
              className="flex-1 p-3 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleQuerySubmit();
                }
              }}
            />
            <button
              className="p-2 hover:bg-gray-50"
              onClick={handleQuerySubmit}
            >
              <svg
                className="w-6 h-6 text-[#1a237e]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDetail;
