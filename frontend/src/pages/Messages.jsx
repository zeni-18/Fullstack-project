import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Send, Search, Image as ImageIcon, MoreVertical, ExternalLink, MessageSquare, Camera } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import CameraCapture from '../components/CameraCapture';

const ENDPOINT = "http://localhost:5000";

const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [socket, setSocket] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [expandedMedia, setExpandedMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Messages • ConnectX';
        const socketInstance = io(ENDPOINT);
        setSocket(socketInstance);

        socketInstance.emit('setup', user?._id);
        socketInstance.on('connected', () => setSocketConnected(true));


        socketInstance.on('receive_message', (message) => {
            if (activeChat && message.conversationId === activeChat._id) {
                setMessages(prev => [...prev, message]);
                axios.get(`/messages/${activeChat._id}`).catch(console.error);
            }
            fetchConversations();
        });

        socketInstance.on('receive_reaction', ({ messageId, reactions }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, reactions } : msg
            ));
        });


        return () => {
            socketInstance.disconnect();
        };
    }, [user, activeChat]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/messages/conversations');
            setConversations(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);


    useEffect(() => {
        if (location.state?.newUser && !loading) {
            handleStartOrOpenChat(location.state.newUser);

            window.history.replaceState({}, document.title);
        }
    }, [location.state, loading, conversations]);

    const fetchMessages = async (conversation) => {
        setActiveChat(conversation);
        setMessages([]);
        try {
            const res = await axios.get(`/messages/${conversation._id}`);
            setMessages(res.data);


            setConversations(prev => prev.map(c => {
                if (c._id === conversation._id && c.lastMessage && c.lastMessage.sender !== user._id) {
                    return { ...c, lastMessage: { ...c.lastMessage, read: true } };
                }
                return c;
            }));

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const clearFileSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCameraCapture = (file) => {
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
        setIsCameraOpen(false);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeChat) return;

        const recipientId = activeChat.participants.find(p => p._id !== user._id)._id;

        try {
            const formData = new FormData();
            formData.append('recipientId', recipientId);
            if (newMessage.trim()) formData.append('text', newMessage);
            if (selectedFile) formData.append('media', selectedFile);


            setNewMessage('');
            clearFileSelection();

            const res = await axios.post('/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages(prev => [...prev, res.data]);


            socket.emit('send_message', {
                recipientId,
                message: res.data
            });

            fetchConversations();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== user?._id);
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            const res = await axios.put(`/messages/${messageId}/react`, { emoji });
            const updatedMessage = res.data;

            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? updatedMessage : msg
            ));

            const recipientId = activeChat.participants.find(p => p._id !== user._id)._id;
            socket.emit('message_reaction', {
                recipientId,
                messageId,
                reactions: updatedMessage.reactions
            });
        } catch (error) {
            console.error("Error reacting to message:", error);
        }
    };

    const formatMessageTime = (dateString, isList = false) => {
        const date = new Date(dateString);
        if (isList) {
            return formatDistanceToNow(date, { addSuffix: false, addPrefix: false })
                .replace('about ', '')
                .replace(' hours', 'h')
                .replace(' minutes', 'm')
                .replace(' seconds', 's')
                .replace(' days', 'd');
        }
        return format(date, 'h:mm a');
    };

    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const res = await axios.get(`/users/search?q=${searchQuery}`);

                    const filtered = res.data.filter(u => u._id !== user._id);
                    setSearchResults(filtered);
                } catch (error) {
                    console.error("Error searching users:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, user]);

    const filteredConversations = conversations.filter(c => {
        const other = getOtherParticipant(c);
        return other?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            other?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleStartOrOpenChat = (selectedUser) => {

        setSearchQuery('');
        setSearchResults([]);

        // Check if a conversation already exists
        const existing = conversations.find(c =>
            getOtherParticipant(c)?._id === selectedUser._id
        );

        if (existing) {
            fetchMessages(existing);
        } else {
            // Setup a temporary activeChat
            const tempConversation = {
                _id: 'temp_' + selectedUser._id,
                participants: [user, selectedUser],
                isNew: true
            };
            setActiveChat(tempConversation);
            setMessages([]);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Navbar />

            <div className="page-content" style={{
                height: 'calc(100vh - 80px)',
                display: 'flex',
                gap: 'var(--spacing-md)'
            }}>


                <div className="card" style={{
                    width: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>

                    <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: 'var(--spacing-md)' }}>Messages</h2>

                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    paddingLeft: '36px',
                                    paddingTop: '10px',
                                    paddingBottom: '10px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid transparent'
                                }}
                            />
                        </div>
                    </div>


                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading || isSearching ? (
                            <div className="flex-center" style={{ padding: 'var(--spacing-xl)' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : searchQuery.trim().length > 0 ? (
                            searchResults.length > 0 ? (
                                searchResults.map(userResult => (
                                    <div
                                        key={userResult._id}
                                        onClick={() => handleStartOrOpenChat(userResult)}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            borderBottom: '1px solid var(--border-light)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            gap: '12px',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        className="hover-bg-secondary"
                                    >
                                        <img
                                            src={userResult.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                            alt={userResult.username}
                                            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div className="flex-between">
                                                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {userResult.fullName || userResult.username}
                                                </span>
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                @{userResult.username}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-center column" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', opacity: 0.6 }}>
                                    <Search size={40} style={{ marginBottom: 'var(--spacing-sm)' }} />
                                    <p>No users found matching "{searchQuery}"</p>
                                </div>
                            )
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map(conversation => {
                                const otherUser = getOtherParticipant(conversation);
                                const isUnread = conversation.lastMessage &&
                                    !conversation.lastMessage.read &&
                                    conversation.lastMessage.sender !== user._id;

                                return (
                                    <div
                                        key={conversation._id}
                                        onClick={() => fetchMessages(conversation)}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            borderBottom: '1px solid var(--border-light)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            gap: '12px',
                                            backgroundColor: activeChat?._id === conversation._id ? 'var(--bg-tertiary)' : 'transparent',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        className="hover-bg-secondary"
                                        onMouseEnter={(e) => {
                                            if (activeChat?._id !== conversation._id) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeChat?._id !== conversation._id) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={otherUser?.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                                alt={otherUser?.username}
                                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            {isUnread && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    width: '12px',
                                                    height: '12px',
                                                    backgroundColor: 'var(--primary)',
                                                    borderRadius: '50%',
                                                    border: '2px solid var(--card-bg)'
                                                }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div className="flex-between">
                                                <span style={{ fontWeight: isUnread ? '800' : '600', color: 'var(--text-main)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {otherUser?.fullName || otherUser?.username}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: isUnread ? 'var(--primary)' : 'var(--text-tertiary)', flexShrink: 0 }}>
                                                    {conversation.lastMessage && formatMessageTime(conversation.updatedAt, true)}
                                                </span>
                                            </div>
                                            <div style={{
                                                color: isUnread ? 'var(--text-main)' : 'var(--text-secondary)',
                                                fontSize: '0.85rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontWeight: isUnread ? '600' : '400'
                                            }}>
                                                {conversation.lastMessage?.sender === user._id ? 'You: ' : ''}
                                                {conversation.lastMessage?.text || "Started a conversation"}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex-center column" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', opacity: 0.6 }}>
                                <MessageSquare size={40} style={{ marginBottom: 'var(--spacing-sm)' }} />
                                <p>No conversations yet.</p>
                                <p style={{ fontSize: '0.85rem' }}>Search for users to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>


                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {activeChat ? (
                        <>

                            <div className="flex-between" style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--glass-bg)' }}>
                                <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                    <Link to={`/profile/${getOtherParticipant(activeChat)?.username}`}>
                                        <img
                                            src={getOtherParticipant(activeChat)?.profileImage || 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/v1/user_profile_default.png'}
                                            alt="avatar"
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    </Link>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                            {getOtherParticipant(activeChat)?.fullName || getOtherParticipant(activeChat)?.username}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                            @{getOtherParticipant(activeChat)?.username}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>


                            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {messages.map((msg, index) => {
                                    const isMine = msg.sender._id === user._id;
                                    const showTime = index === 0 || new Date(msg.createdAt) - new Date(messages[index - 1].createdAt) > 5 * 60 * 1000;

                                    return (
                                        <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                            {showTime && (
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '12px 0 4px 0', alignSelf: 'center' }}>
                                                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                                                </div>
                                            )}
                                            <div style={{
                                                maxWidth: '70%',
                                                padding: msg.text ? '10px 16px' : '4px',
                                                borderRadius: 'var(--radius-lg)',
                                                borderBottomRightRadius: isMine ? '4px' : 'var(--radius-lg)',
                                                borderBottomLeftRadius: !isMine ? '4px' : 'var(--radius-lg)',
                                                backgroundColor: isMine ? 'var(--primary)' : 'var(--bg-secondary)',
                                                color: isMine ? 'white' : 'var(--text-main)',
                                                boxShadow: 'var(--shadow-xs)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}>
                                                {msg.imageUrl && (
                                                    <img
                                                        src={`http://localhost:5000${msg.imageUrl}`}
                                                        alt="Attachment"
                                                        onClick={() => setExpandedMedia({ type: 'image', url: `http://localhost:5000${msg.imageUrl}` })}
                                                        style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', objectFit: 'contain', maxHeight: '300px', cursor: 'pointer' }}
                                                    />
                                                )}
                                                {msg.videoUrl && (
                                                    <div onClick={() => setExpandedMedia({ type: 'video', url: `${ENDPOINT}${msg.videoUrl}` })} style={{ cursor: 'zoom-in' }}>
                                                        <VideoPlayer
                                                            src={`${ENDPOINT}${msg.videoUrl}`}
                                                            className="message-video"
                                                            forcePause={!!expandedMedia}
                                                        />
                                                    </div>
                                                )}
                                                {msg.text && <p style={{ margin: 0, wordBreak: 'break-word', fontSize: '0.95rem' }}>{msg.text}</p>}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {['❤️', '👍', '🔥', '😂', '😮', '😢'].map(emoji => (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => handleReaction(msg._id, emoji)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    padding: '2px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    opacity: msg.reactions?.some(r => r.user._id === user._id && r.emoji === emoji) ? 1 : 0.4,
                                                                    transition: 'opacity 0.2s'
                                                                }}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>
                                                        {formatMessageTime(msg.createdAt)}
                                                    </div>
                                                </div>

                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '4px',
                                                        marginTop: '4px',
                                                        padding: '4px 8px',
                                                        backgroundColor: isMine ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                        borderRadius: 'var(--radius-sm)'
                                                    }}>
                                                        {Object.entries(
                                                            msg.reactions.reduce((acc, curr) => {
                                                                acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                                                return acc;
                                                            }, {})
                                                        ).map(([emoji, count]) => (
                                                            <span key={emoji} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                                {emoji} <span style={{ fontWeight: '700' }}>{count}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>


                            <div style={{ padding: '16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--glass-bg)', display: 'flex', flexDirection: 'column' }}>
                                {filePreview && (
                                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                                        {selectedFile.type.startsWith('image/') ? (
                                            <img src={filePreview} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <video src={filePreview} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>{selectedFile.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <button onClick={clearFileSelection} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={sendMessage} className="flex gap-sm" style={{ width: '100%' }}>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn-ghost"
                                        style={{
                                            padding: '10px',
                                            borderRadius: 'var(--radius-full)',
                                            color: 'var(--text-secondary)',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Attach Media"
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    >
                                        <ImageIcon size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCameraOpen(true)}
                                        className="btn-ghost"
                                        style={{
                                            padding: '10px',
                                            borderRadius: 'var(--radius-full)',
                                            color: 'var(--text-secondary)',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Open Camera"
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    >
                                        <Camera size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Message..."
                                        style={{
                                            flex: 1,
                                            borderRadius: 'var(--radius-full)',
                                            padding: '12px 20px',
                                            backgroundColor: 'var(--bg)'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() && !selectedFile}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: (newMessage.trim() || selectedFile) ? 'var(--primary)' : 'var(--bg-secondary)',
                                            color: (newMessage.trim() || selectedFile) ? 'white' : 'var(--text-tertiary)',
                                            border: 'none',
                                            cursor: (newMessage.trim() || selectedFile) ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: (newMessage.trim() || selectedFile) ? 'var(--shadow-sm)' : 'none'
                                        }}
                                    >
                                        <Send size={18} style={{ transform: 'translateX(1px)' }} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-center column" style={{ height: '100%', color: 'var(--text-secondary)' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                border: '2px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px'
                            }}>
                                <Send size={32} />
                            </div>
                            <h3 style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Your Messages</h3>
                            <p>Select a conversation or start a new one.</p>
                        </div>
                    )}
                </div>

            </div>


            <AnimatePresence>
                {isCameraOpen && (
                    <CameraCapture
                        onCapture={handleCameraCapture}
                        onClose={() => setIsCameraOpen(false)}
                    />
                )}
                {expandedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setExpandedMedia(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'zoom-out',
                            padding: 'var(--spacing-xl)'
                        }}
                    >
                        {expandedMedia.type === 'image' ? (
                            <motion.img
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                src={expandedMedia.url}
                                alt="Expanded content"
                                style={{
                                    maxWidth: '90%',
                                    maxHeight: '90vh',
                                    objectFit: 'contain',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <motion.video
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                src={expandedMedia.url}
                                controls
                                autoPlay
                                style={{
                                    maxWidth: '95%',
                                    maxHeight: '95vh',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    outline: 'none'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                        <button
                            onClick={() => setExpandedMedia(null)}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                color: 'white',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Messages;
