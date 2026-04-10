import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, User, Bot, Trash2, Maximize2, Minimize2, Image as ImageIcon, Paperclip, MessageSquare, Plus, History, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AIChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [view, setView] = useState('chat'); // 'chat' or 'conversations'
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/ai/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to fetch AI conversations:', error);
        }
    };

    const fetchConversation = async (id) => {
        setLoading(true);
        setView('chat');
        setCurrentConversationId(id);
        try {
            const res = await axios.get(`/ai/conversations/${id}`);
            setChatHistory(res.data.messages);
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setChatHistory([]);
        setCurrentConversationId(null);
        setView('chat');
        setMessage('');
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen, view]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!message.trim() && !selectedImage) || loading) return;

        let userMessage;
        if (selectedImage) {
            // In a real app, we'd upload this or send as base64
            // For this demo, we'll send the text + mention there's an image
            userMessage = { role: "user", parts: [{ text: `${message} [Image Attached]` }] };
        } else {
            userMessage = { role: "user", parts: [{ text: message }] };
        }

        const currentMessage = message;
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        const capturedImage = imagePreview;
        setImagePreview(null);
        setSelectedImage(null);
        setLoading(true);

        try {
            const res = await axios.post('/ai/chat', {
                message: currentMessage,
                history: chatHistory.map(h => ({ role: h.role, parts: h.parts })),
                conversationId: currentConversationId
            });

            const aiResponse = { role: "model", parts: [{ text: res.data.response }] };
            setChatHistory(prev => [...prev, aiResponse]);

            if (!currentConversationId && res.data.conversationId) {
                setCurrentConversationId(res.data.conversationId);
                fetchConversations();
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            const backendError = error.response?.data?.error;
            const msg = error.response?.data?.message || "AI connection error";
            const fullError = backendError ? `${msg}: ${backendError}` : msg;

            setChatHistory(prev => [...prev, {
                role: "model",
                parts: [{ text: fullError }]
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setChatHistory([]);
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fab"
                        style={{
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--gradient-primary)',
                            boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
                        }}
                    >
                        <Sparkles size={28} color="white" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            x: 0,
                            height: isMinimized ? '64px' : '550px',
                            width: isMinimized ? '200px' : '400px'
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
                        className="card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-xl)',
                            background: 'var(--bg-secondary)',
                            backdropFilter: 'none'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px',
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
                                {view === 'conversations' ? (
                                    <button onClick={() => setView('chat')} style={{ color: 'white' }}>
                                        <ChevronLeft size={20} />
                                    </button>
                                ) : (
                                    <Sparkles size={20} />
                                )}
                                <span style={{ fontWeight: '800', fontSize: '1rem' }}>
                                    {view === 'conversations' ? 'Chat History' : 'ConnectX AI'}
                                </span>
                            </div>
                            <div className="flex" style={{ gap: '12px' }}>
                                {view === 'chat' && (
                                    <>
                                        <button onClick={handleNewChat} title="New Chat" style={{ color: 'white' }}>
                                            <Plus size={20} />
                                        </button>
                                        <button onClick={() => setView('conversations')} title="All Chats" style={{ color: 'white' }}>
                                            <History size={20} />
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setIsMinimized(!isMinimized)} style={{ color: 'white' }}>
                                    {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} style={{ color: 'white' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {view === 'conversations' ? (
                                    /* Conversations List View */
                                    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {conversations.length === 0 ? (
                                            <div className="flex-center column" style={{ height: '100%', opacity: 0.5, gap: '12px' }}>
                                                <MessageSquare size={40} strokeWidth={1} />
                                                <p>No past conversations found.</p>
                                            </div>
                                        ) : (
                                            conversations.map((conv) => (
                                                <button
                                                    key={conv._id}
                                                    onClick={() => fetchConversation(conv._id)}
                                                    className="card"
                                                    style={{
                                                        padding: '12px 16px',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '4px',
                                                        border: currentConversationId === conv._id ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                        background: currentConversationId === conv._id ? 'var(--bg-secondary)' : 'transparent',
                                                        transition: 'var(--transition)'
                                                    }}
                                                >
                                                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{conv.title}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        {new Date(conv.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    /* Chat View */
                                    <>
                                        {/* Chat Area */}
                                        <div
                                            ref={scrollRef}
                                            style={{
                                                flex: 1,
                                                overflowY: 'auto',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '16px',
                                                background: 'var(--bg)'
                                            }}
                                        >
                                            {chatHistory.length === 0 && (
                                                <div className="flex-center column" style={{ height: '100%', opacity: 0.5, gap: '12px', textAlign: 'center' }}>
                                                    <Bot size={48} strokeWidth={1} />
                                                    <p style={{ fontSize: '0.9rem' }}>Hi {user?.username}! I'm your AI assistant. How can I help you today?</p>
                                                </div>
                                            )}
                                            {chatHistory.map((msg, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                                        maxWidth: '85%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <div style={{
                                                        padding: '10px 14px',
                                                        borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                                        background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                                                        color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                                        fontSize: '0.9rem',
                                                        boxShadow: 'var(--shadow-xs)',
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {msg.parts[0].text}
                                                    </div>
                                                </div>
                                            ))}
                                            {loading && (
                                                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-secondary)', padding: '10px 16px', borderRadius: '18px 18px 18px 2px' }}>
                                                    <div className="flex gap-xs">
                                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Preview Image */}
                                        {imagePreview && (
                                            <div style={{ padding: '8px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                                                <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                                                    <img src={imagePreview} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} alt="Preview" />
                                                    <button
                                                        onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                                                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--bg-secondary)', borderRadius: '50%', padding: '2px', border: '1px solid var(--border)' }}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Input Area */}
                                        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                                            <form onSubmit={handleSendMessage} className="flex column" style={{ gap: '12px' }}>
                                                <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        style={{ color: 'var(--text-secondary)' }}
                                                    >
                                                        <ImageIcon size={20} />
                                                    </button>
                                                    <input
                                                        type="file"
                                                        hidden
                                                        ref={fileInputRef}
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />

                                                    <input
                                                        type="text"
                                                        placeholder="Ask Gemini anything..."
                                                        value={message}
                                                        onChange={(e) => setMessage(e.target.value)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '10px 16px',
                                                            borderRadius: 'var(--radius-full)',
                                                            border: '1px solid var(--border)',
                                                            background: 'var(--bg)',
                                                            fontSize: '0.9rem',
                                                            color: 'var(--text-main)'
                                                        }}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={loading || (!message.trim() && !selectedImage)}
                                                        className="btn-primary"
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex-between" style={{ opacity: 0.6 }}>
                                                    <button type="button" onClick={clearChat} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Trash2 size={12} /> Clear Chat
                                                    </button>
                                                    <span style={{ fontSize: '0.75rem' }}>History auto-saved</span>
                                                </div>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIChat;
