import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { Spinner } from '../components/UI';
import { Send, Paperclip, Search } from 'lucide-react';
import { io } from 'socket.io-client';

let socket;

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef();
  const typingTimeout = useRef();

  useEffect(() => {
    if (!user) return;
    socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.emit('join', user._id);
    socket.on('new_message', (msg) => {
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
    });
    socket.on('typing', ({ senderId }) => { if (senderId === activeUser?._id) setTyping(true); });
    socket.on('stop_typing', ({ senderId }) => { if (senderId === activeUser?._id) setTyping(false); });
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    API.get('/messages/conversations').then(r => {
      setConversations(r.data.conversations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (userId) loadMessages(userId);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (uid) => {
    setMsgLoading(true);
    try {
      const [msgRes, userRes] = await Promise.all([
        API.get(`/messages/${uid}`),
        API.get(`/users/${uid}`)
      ]);
      setMessages(msgRes.data.messages || []);
      setActiveUser(userRes.data.user);
    } catch {} finally { setMsgLoading(false); }
  };

  const handleSelect = (conv) => {
    const other = conv.sender?._id === user._id ? conv.receiver : conv.sender;
    setActiveUser(other);
    navigate(`/messages/${other._id}`);
    loadMessages(other._id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;
    const msg = { text, receiver: activeUser._id };
    const optimistic = { _id: Date.now(), text, sender: { _id: user._id, name: user.name }, createdAt: new Date() };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    socket.emit('stop_typing', { receiverId: activeUser._id, senderId: user._id });
    try {
      await API.post(`/messages/${activeUser._id}`, msg);
    } catch {}
  };

  const handleTyping = () => {
    if (!activeUser) return;
    socket.emit('typing', { receiverId: activeUser._id, senderId: user._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { receiverId: activeUser._id, senderId: user._id });
    }, 2000);
  };

  const filteredConvs = conversations.filter(c => {
    const other = c.sender?._id === user?._id ? c.receiver : c.sender;
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Messages</h1>
      <div style={{ display: 'flex', flex: 1, gap: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden', minHeight: 0 }}>

        {/* Conversations Sidebar */}
        <div style={{ width: 280, borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px' }}>
              <Search size={14} color="#64748b" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#f1f5f9', flex: 1, padding: 0 }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? <Spinner size={24} /> : filteredConvs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#475569', fontSize: 13 }}>No conversations yet</div>
            ) : filteredConvs.map((conv, i) => {
              const other = conv.sender?._id === user?._id ? conv.receiver : conv.sender;
              const isActive = activeUser?._id === other?._id;
              return (
                <div key={i} onClick={() => handleSelect(conv)} style={{ padding: '12px 14px', cursor: 'pointer', background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent', borderLeft: isActive ? '3px solid #f97316' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{other?.name?.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{other?.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.text || 'Start a conversation'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        {activeUser ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Chat Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{activeUser.name?.charAt(0)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{activeUser.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{activeUser.role}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {msgLoading ? <Spinner size={24} /> : messages.map((msg, i) => {
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMine ? '#f97316' : '#0f172a', color: isMine ? 'white' : '#f1f5f9', fontSize: 13, lineHeight: 1.5 }}>
                      {msg.text}
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine && msg.isRead && ' ✓✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', background: '#0f172a', borderRadius: '14px 14px 14px 4px', fontSize: 13, color: '#64748b' }}>typing...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '12px 20px', borderTop: '1px solid #334155', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <input value={text} onChange={e => { setText(e.target.value); handleTyping(); }} placeholder={`Message ${activeUser.name}...`} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)} />
              <button type="submit" disabled={!text.trim()} style={{ padding: '10px 16px', background: text.trim() ? '#f97316' : '#334155', color: 'white', border: 'none', borderRadius: 8, cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#475569' }}>
            <div style={{ fontSize: 40 }}>💬</div>
            <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 600 }}>Select a conversation</div>
            <div style={{ fontSize: 13 }}>or start messaging a freelancer/client from their profile</div>
          </div>
        )}
      </div>
    </div>
  );
}
