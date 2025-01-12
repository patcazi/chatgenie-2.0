import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton,
  Paper,
  Divider,
  Tab,
  Tabs,
  Badge,
  Avatar,
  Popover,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EmojiPicker from 'emoji-picker-react';
import io from 'socket.io-client';
import axios from 'axios';

const drawerWidth = 240;

function Chat({ setIsAuthenticated }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState({ type: 'channel', id: null });
  const [tabValue, setTabValue] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log('Connecting socket with token:', token);
    
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    setCurrentUser({
      id: tokenData.userId,
      username: tokenData.username
    });
    
    const socket = io('http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      setSocketConnected(true);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    socket.on('users', (users) => {
      console.log('Received users list:', users);
      const filteredUsers = users.filter(user => user.id !== currentUser?.id);
      console.log('Filtered users (excluding current user):', filteredUsers);
      setOnlineUsers(filteredUsers);
    });

    socket.on('message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    setSocket(socket);

    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentChat.id) {
      if (currentChat.type === 'channel') {
        fetchChannelMessages(currentChat.id);
      } else if (currentChat.type === 'direct') {
        fetchDirectMessages(currentChat.id);
      }
    }
  }, [currentChat.id, currentChat.type]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChannels = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/channels', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      setChannels(response.data);
      if (response.data.length > 0) {
        setCurrentChat({ type: 'channel', id: response.data[0].id });
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchChannelMessages = async (channelId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/messages/${channelId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchDirectMessages = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/messages/direct/${userId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat.id) return;

    try {
      let response;
      const currentUserId = JSON.parse(atob(sessionStorage.getItem('token').split('.')[1])).userId;
      console.log('Sending message:', {
        type: currentChat.type,
        content: newMessage,
        currentChat,
        currentUserId
      });

      if (currentChat.type === 'channel') {
        response = await axios.post(
          'http://localhost:4000/api/messages',
          {
            content: newMessage,
            channelId: currentChat.id,
            type: 'channel'
          },
          {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          }
        );
      } else {
        response = await axios.post(
          'http://localhost:4000/api/messages/direct',
          {
            content: newMessage,
            receiverId: currentChat.id,
            type: 'direct'
          },
          {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          }
        );
      }

      console.log('Message sent successfully:', response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response || error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUserClick = (userId) => {
    console.log('Switching to direct chat with user:', userId);
    setCurrentChat({ type: 'direct', id: userId });
    setTabValue(1); // Switch to Messages tab
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    setIsAuthenticated(false);
    socket?.disconnect();
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setAnchorEl(null);
  };

  const handleEmojiButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmoji = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            ChatGenie - {currentChat.type === 'channel' ? 'Channel' : 'Direct Message'}
          </Typography>
          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                variant="dot"
                color="success"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {currentUser.username[0].toUpperCase()}
                </Avatar>
              </Badge>
              <Typography sx={{ ml: 1 }}>
                {currentUser.username}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Channels" />
            <Tab label="Users" />
          </Tabs>
          {tabValue === 0 ? (
            <List>
              {channels.map((channel) => (
                <ListItem
                  button
                  key={channel.id}
                  selected={currentChat.type === 'channel' && currentChat.id === channel.id}
                  onClick={() => setCurrentChat({ type: 'channel', id: channel.id })}
                >
                  <ListItemText primary={channel.name} />
                </ListItem>
              ))}
            </List>
          ) : (
            <List>
              {onlineUsers.length > 0 ? (
                onlineUsers.map((user) => (
                  <ListItem
                    button
                    key={user.id}
                    selected={currentChat.type === 'direct' && currentChat.id === user.id}
                    onClick={() => handleUserClick(user.id)}
                  >
                    <ListItemIcon>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color="success"
                      >
                        <PersonIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary={user.username} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No users online" />
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Paper
          sx={{
            height: 'calc(100vh - 180px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message, index) => {
              const currentUserId = JSON.parse(atob(sessionStorage.getItem('token').split('.')[1])).userId;
              const isOwnMessage = message.senderId === currentUserId;
              
              return (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {message.sender?.username || 'Unknown User'}
                  </Typography>
                  <Paper
                    sx={{
                      p: 1,
                      bgcolor: isOwnMessage ? 'primary.light' : 'background.default',
                      color: isOwnMessage ? 'white' : 'text.primary',
                      maxWidth: '80%',
                    }}
                  >
                    <Typography>{message.content}</Typography>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
          <Divider />
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{ p: 2, backgroundColor: 'background.default' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                color="primary" 
                onClick={handleEmojiButtonClick}
                sx={{ mr: 1 }}
              >
                <EmojiEmotionsIcon />
              </IconButton>
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseEmoji}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </Popover>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{ mr: 1 }}
              />
              <IconButton type="submit" color="primary">
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default Chat; 