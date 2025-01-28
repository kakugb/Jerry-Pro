import React from 'react';
import { Link } from 'react-router-dom';

const Chatbot = () => {
  const Chatbots =[
    {
      "id":"1",
      "name":"AI Code Academy Chatbot",
      "description":"Description for Chatbot A"
    }
  ]

 
  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold text-[#002B4D] mb-6">Chatbots</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#224289] text-white">
              <th className="py-4 px-6 text-left">#</th>
              <th className="py-4 px-6 text-left">NAME</th>
              <th className="py-4 px-6 text-left">DESCRIPTION</th>
              <th className="py-4 px-6 text-left">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {
              Chatbots.map((chats,ind)=>(
                <tr className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">{chats.id}</td>
                <td className="py-4 px-6">{chats.name}</td>
                <td className="py-4 px-6">{chats.description}</td>
                <td className="py-4 px-6">
                  <Link to={`/chatbot/${chats.id}`}>
                  <button className="bg-[#224289] text-white px-4 py-2 rounded-md hover:bg-[#224289] cursor-pointer">
                    Select
                  </button>
                  </Link>
                </td>
              </tr>
              ))
            }
           
          </tbody>
        </table>
      </div>
    </div>
  );
};

 

export default Chatbot