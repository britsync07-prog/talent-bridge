'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface Partner {
  id: string;
  email: string;
  role: string;
  employerProfile?: any;
  engineerProfile?: any;
}

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socketRef.current.emit('join', user.id);

    socketRef.current.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Fetch chat partners
    api.get('/messages/chat/partners').then(({ data }) => setPartners(data)).catch(console.error);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (activePartner) {
      api.get(`/messages/${activePartner.id}`).then(({ data }) => setMessages(data)).catch(console.error);
    }
  }, [activePartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner || !user) return;

    try {
      const { data: message } = await api.post('/messages', {
        receiverId: activePartner.id,
        content: newMessage
      });

      // Emit via socket
      socketRef.current?.emit('sendMessage', message);
      
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex gap-6">
        
        {/* Sidebar */}
        <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {partners.map(p => {
              const name = p.engineerProfile?.fullName || p.employerProfile?.companyName || p.email;
              return (
                <div 
                  key={p.id} 
                  onClick={() => setActivePartner(p)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${activePartner?.id === p.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="font-semibold text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500 capitalize">{p.role}</div>
                </div>
              );
            })}
            {partners.length === 0 && <div className="p-4 text-gray-500 text-sm">No conversations yet.</div>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {activePartner ? (
            <>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {activePartner.engineerProfile?.fullName || activePartner.employerProfile?.companyName || activePartner.email}
                </h2>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 flex flex-col gap-4">
                {messages.map(m => {
                  const isMe = m.senderId === user.id;
                  return (
                    <div key={m.id} className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-blue-600 text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 self-start rounded-bl-none shadow-sm'}`}>
                      {m.content}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}