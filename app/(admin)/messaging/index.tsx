import React, { useState, useCallback, useRef } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, TextInput as RNTextInput } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { Text, Card, TextInput, IconButton, Badge, Chip, Searchbar, FAB, Menu, Avatar } from 'react-native-paper';
import { MessageCircle, Send, Phone, Video, MoreVertical, Plus, Search, Filter, Paperclip, Image, Mic } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'driver' | 'customer' | 'dispatcher';
  message: string;
  timestamp: string;
  isRead: boolean;
  attachments?: {
    id: string;
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

interface Chat {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    name: string;
    role: 'admin' | 'driver' | 'customer' | 'dispatcher';
    avatar?: string;
    online: boolean;
    lastSeen?: string;
  }[];
  lastMessage: Message;
  unreadCount: number;
  type: 'direct' | 'group' | 'broadcast';
  title?: string;
  relatedLoadId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Mock messaging data
const mockChats: Chat[] = [
  {
    id: 'chat-1',
    participantIds: ['user1', 'user2'],
    participants: [
      { id: 'user1', name: 'John Smith', role: 'driver', online: true },
      { id: 'user2', name: 'Sarah Williams', role: 'dispatcher', online: true }
    ],
    lastMessage: {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user1',
      senderName: 'John Smith',
      senderRole: 'driver',
      message: 'ETA updated - will arrive 30 minutes early',
      timestamp: '2025-06-19T14:45:00Z',
      isRead: false
    },
    unreadCount: 2,
    type: 'direct',
    relatedLoadId: 'L-2025-001',
    priority: 'normal'
  },
  {
    id: 'chat-2',
    participantIds: ['user3', 'user4'],
    participants: [
      { id: 'user3', name: 'ABC Manufacturing', role: 'customer', online: false, lastSeen: '2025-06-19T13:30:00Z' },
      { id: 'user4', name: 'Mike Johnson', role: 'admin', online: true }
    ],
    lastMessage: {
      id: 'msg-2',
      chatId: 'chat-2',
      senderId: 'user3',
      senderName: 'ABC Manufacturing',
      senderRole: 'customer',
      message: 'Can you provide POD for shipment WG123456?',
      timestamp: '2025-06-19T13:15:00Z',
      isRead: true
    },
    unreadCount: 0,
    type: 'direct',
    relatedLoadId: 'L-2025-002',
    priority: 'high'
  },
  {
    id: 'chat-3',
    participantIds: ['user5', 'user6', 'user7'],
    participants: [
      { id: 'user5', name: 'Fleet Operations', role: 'dispatcher', online: true },
      { id: 'user6', name: 'Robert Davis', role: 'driver', online: false, lastSeen: '2025-06-19T12:00:00Z' },
      { id: 'user7', name: 'Emily Chen', role: 'admin', online: true }
    ],
    lastMessage: {
      id: 'msg-3',
      chatId: 'chat-3',
      senderId: 'user5',
      senderName: 'Fleet Operations',
      senderRole: 'dispatcher',
      message: 'Vehicle T-003 needs immediate maintenance',
      timestamp: '2025-06-19T11:30:00Z',
      isRead: false
    },
    unreadCount: 1,
    type: 'group',
    title: 'Fleet Maintenance Alert',
    priority: 'urgent'
  },
  {
    id: 'chat-4',
    participantIds: ['user8', 'user9'],
    participants: [
      { id: 'user8', name: 'XYZ Logistics', role: 'customer', online: true },
      { id: 'user9', name: 'Jennifer Lopez', role: 'dispatcher', online: true }
    ],
    lastMessage: {
      id: 'msg-4',
      chatId: 'chat-4',
      senderId: 'user9',
      senderName: 'Jennifer Lopez',
      senderRole: 'dispatcher',
      message: 'Your shipment is loaded and ready for pickup',
      timestamp: '2025-06-19T10:45:00Z',
      isRead: true
    },
    unreadCount: 0,
    type: 'direct',
    relatedLoadId: 'L-2025-003',
    priority: 'normal'
  }
];

export default function MessagingScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [filteredChats, setFilteredChats] = useState<Chat[]>(mockChats);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setChats(mockChats);
    setFilteredChats(mockChats);
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    let filtered = chats;

    if (query.trim() !== '') {
      filtered = filtered.filter(chat =>
        chat.participants.some(p => p.name.toLowerCase().includes(query.toLowerCase())) ||
        chat.lastMessage.message.toLowerCase().includes(query.toLowerCase()) ||
        (chat.title && chat.title.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filtered = filtered.filter(chat => chat.unreadCount > 0);
      } else if (selectedFilter === 'urgent') {
        filtered = filtered.filter(chat => chat.priority === 'urgent' || chat.priority === 'high');
      }
    }

    setFilteredChats(filtered);
  };

  const handleFilterChange = (filter: 'all' | 'unread' | 'urgent') => {
    setSelectedFilter(filter);
    let filtered = chats;

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(chat =>
        chat.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        chat.lastMessage.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.title && chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(chat => chat.unreadCount > 0);
      } else if (filter === 'urgent') {
        filtered = filtered.filter(chat => chat.priority === 'urgent' || chat.priority === 'high');
      }
    }

    setFilteredChats(filtered);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'normal':
        return theme.colors.primary;
      case 'low':
        return theme.colors.outline;
      default:
        return theme.colors.outline;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver':
        return '#007AFF';
      case 'customer':
        return '#34C759';
      case 'dispatcher':
        return '#FF9500';
      case 'admin':
        return '#8E8E93';
      default:
        return theme.colors.primary;
    }
  };

  const handleMarkAsRead = (chatId: string) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0, lastMessage: { ...chat.lastMessage, isRead: true } }
          : chat
      )
    );
    setFilteredChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0, lastMessage: { ...chat.lastMessage, isRead: true } }
          : chat
      )
    );
  };

  const handleDeleteChat = (chatId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
            setFilteredChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
          }
        }
      ]
    );
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const participantNames = item.type === 'group' && item.title 
      ? item.title 
      : item.participants.filter(p => p.id !== 'current-user').map(p => p.name).join(', ');
    
    const lastMessagePreview = item.lastMessage.message.length > 50 
      ? item.lastMessage.message.substring(0, 50) + '...'
      : item.lastMessage.message;

    return (
      <TouchableOpacity
        onPress={() => {
          handleMarkAsRead(item.id);
          router.push(`/(admin)/messaging/${item.id}`);
        }}
        onLongPress={() => handleDeleteChat(item.id)}
      >
        <Card style={{ marginHorizontal: 16, marginVertical: 4, backgroundColor: item.unreadCount > 0 ? `${theme.colors.primaryContainer}20` : theme.colors.surface }}>
          <Card.Content style={{ paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <View style={{ marginRight: 12 }}>
                <Avatar.Text 
                  size={48}
                  label={participantNames.substring(0, 2).toUpperCase()}
                  style={{ backgroundColor: getRoleColor(item.participants[0]?.role || 'admin') }}
                />
                {item.participants[0]?.online && (
                  <View style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#34C759',
                    borderWidth: 2,
                    borderColor: theme.colors.surface
                  }} />
                )}
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Text 
                    variant="titleMedium" 
                    style={{ 
                      fontWeight: item.unreadCount > 0 ? 'bold' : 'normal',
                      flex: 1,
                      marginRight: 8
                    }}
                  >
                    {participantNames}
                  </Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatTime(item.lastMessage.timestamp)}
                    </Text>
                    {item.unreadCount > 0 && (
                      <Badge 
                        size={18}
                        style={{ backgroundColor: theme.colors.primary, marginTop: 4 }}
                      >
                        {item.unreadCount}
                      </Badge>
                    )}
                  </View>
                </View>

                <Text 
                  variant="bodyMedium" 
                  style={{ 
                    color: item.unreadCount > 0 ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: item.unreadCount > 0 ? '500' : 'normal',
                    marginBottom: 8
                  }}
                >
                  {item.lastMessage.senderName}: {lastMessagePreview}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.type === 'group' && (
                      <Chip 
                        mode="outlined" 
                        textStyle={{ fontSize: 10 }}
                        style={{ height: 24, marginRight: 8 }}
                      >
                        Group
                      </Chip>
                    )}
                    {item.relatedLoadId && (
                      <Chip 
                        mode="outlined" 
                        textStyle={{ fontSize: 10 }}
                        style={{ height: 24, marginRight: 8 }}
                      >
                        {item.relatedLoadId}
                      </Chip>
                    )}
                  </View>
                  
                  {item.priority !== 'normal' && (
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: getPriorityColor(item.priority)
                    }} />
                  )}
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.onSurface },
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon={() => <MoreVertical size={24} color={theme.colors.onSurface} />}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => setMenuVisible(false)} title="Mark All as Read" />
              <Menu.Item onPress={() => setMenuVisible(false)} title="Export Messages" />
              <Menu.Item onPress={() => setMenuVisible(false)} title="Settings" />
            </Menu>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header Summary */}
        <View style={{ padding: 16, backgroundColor: theme.colors.surface }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MessageCircle size={24} color={theme.colors.primary} />
            <Heading level={2} style={{ marginLeft: 8, flex: 1 }}>
              Messages
            </Heading>
            {totalUnread > 0 && (
              <Badge size={24} style={{ backgroundColor: theme.colors.primary }}>
                {totalUnread}
              </Badge>
            )}
          </View>
          
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {filteredChats.length} conversations • {totalUnread} unread
          </Text>
        </View>

        {/* Search and Filters */}
        <View style={{ padding: 16 }}>
          <Searchbar
            placeholder="Search conversations..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={{ marginBottom: 12 }}
          />
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip
              mode={selectedFilter === 'all' ? 'flat' : 'outlined'}
              onPress={() => handleFilterChange('all')}
              style={selectedFilter === 'all' ? { backgroundColor: theme.colors.primary } : {}}
              textStyle={selectedFilter === 'all' ? { color: '#FFFFFF' } : {}}
            >
              All
            </Chip>
            <Chip
              mode={selectedFilter === 'unread' ? 'flat' : 'outlined'}
              onPress={() => handleFilterChange('unread')}
              style={selectedFilter === 'unread' ? { backgroundColor: theme.colors.primary } : {}}
              textStyle={selectedFilter === 'unread' ? { color: '#FFFFFF' } : {}}
            >
              Unread ({chats.filter(c => c.unreadCount > 0).length})
            </Chip>
            <Chip
              mode={selectedFilter === 'urgent' ? 'flat' : 'outlined'}
              onPress={() => handleFilterChange('urgent')}
              style={selectedFilter === 'urgent' ? { backgroundColor: theme.colors.primary } : {}}
              textStyle={selectedFilter === 'urgent' ? { color: '#FFFFFF' } : {}}
            >
              Urgent ({chats.filter(c => c.priority === 'urgent' || c.priority === 'high').length})
            </Chip>
          </View>
        </View>

        {/* Chat List */}
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />

        {/* New Message FAB */}
        <FAB
          icon={() => <Plus size={24} color="#FFFFFF" />}
          style={{
            position: 'absolute',
            bottom: 16 + insets.bottom,
            right: 16,
            backgroundColor: theme.colors.primary,
          }}
          onPress={() => router.push('/(admin)/messaging/new')}
        />
      </View>
    </ScreenWrapper>
  );
}
