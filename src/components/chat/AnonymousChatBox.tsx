'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/types';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Lock,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AnonymousChatBoxProps {
  requestId: string;
  patientName?: string;
  hospitalName?: string;
}

export const AnonymousChatBox: React.FC<AnonymousChatBoxProps> = ({
  requestId,
  patientName = 'Patient',
  hospitalName = 'Hospital',
}) => {
  const { currentUser, currentDonor } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userRole, setUserRole] = useState<'recipient' | 'donor'>('recipient');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Determine role based on auth context
  useEffect(() => {
    if (currentUser?.role === 'donor' || currentDonor) {
      setUserRole('donor');
    } else {
      setUserRole('recipient');
    }
  }, [currentUser, currentDonor]);

  // Load chat messages
  const loadMessages = () => {
    const chatHistory = db.getChatMessages(requestId);
    setMessages(chatHistory);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Polling for simulated live updates
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const senderAlias =
      userRole === 'donor'
        ? `Volunteer Donor #${currentUser?.id?.slice(-4) || '7821'}`
        : `Requester (${patientName}'s Family)`;

    db.addChatMessage({
      request_id: requestId,
      sender_id: currentUser?.id || (userRole === 'donor' ? 'donor-1' : 'recipient-1'),
      sender_role: userRole,
      sender_alias: senderAlias,
      message: text,
    });

    setInputMessage('');
    loadMessages();
  };

  const quickPrompts =
    userRole === 'donor'
      ? [
          'On my way to the hospital now. ETA 30 mins.',
          'Reached blood bank reception. Who should I contact?',
          'Cross-match sample submitted.',
        ]
      : [
          `We are on the 2nd floor, Blood Bank reception at ${hospitalName}.`,
          'Please share your token number when you reach.',
          'Thank you immensely for coming to save our patient!',
        ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/80 flex items-center justify-center text-medical-red">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Secure Anonymous Donor Coordination</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Active Room
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct live communication without disclosing private personal phone numbers.
            </p>
          </div>
        </div>

        {/* Persona toggle for testing */}
        <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1.5">
            Chatting as:
          </span>
          <button
            type="button"
            onClick={() => setUserRole('recipient')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              userRole === 'recipient'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Recipient
          </button>
          <button
            type="button"
            onClick={() => setUserRole('donor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              userRole === 'donor'
                ? 'bg-medical-red text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Donor
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
        <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>
          Protected coordination channel. Coordinates arrival, gate entrance, and blood bank token exchange safely.
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="h-64 sm:h-72 overflow-y-auto p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-2">
            <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold">No messages exchanged yet.</p>
            <p className="text-[11px] max-w-xs">
              Send a message below to coordinate hospital arrival or answer intake questions.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_role === userRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {msg.sender_alias}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                    isMe
                      ? userRole === 'donor'
                        ? 'bg-medical-red text-white rounded-br-none'
                        : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Responses */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick Responses:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-medical-red border border-slate-200/60 dark:border-slate-700/60 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 pt-1"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message as ${userRole === 'donor' ? 'Anonymous Donor' : 'Requester'}...`}
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="px-4 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
