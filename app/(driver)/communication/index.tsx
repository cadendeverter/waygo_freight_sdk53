// waygo-freight/app/(driver)/communication/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, FlatList, RefreshControl, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  Badge,
  IconButton,
  Surface,
  Divider,
  TextInput,
  Avatar,
  Menu,
  Dialog,
  Portal,
  FAB,
  List,
  Searchbar,
  Switch
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  MessageSquare,
  Send,
  Phone,
  PhoneCall,
  Mic,
  Camera,
  Paperclip,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  User,
  Settings,
  Bell,
  BellOff,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  Trash,
  Archive,
  Flag,
  Volume2,
  VolumeX
} from '../../../utils/icons';

import { useAuth } from '../../../state/authContext';
import { useLoad } from '../../../state/loadContext';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'DRIVER' | 'DISPATCHER' | 'ADMIN' | 'CUSTOMER' | 'SYSTEM';
  recipientId?: string;
  recipientName?: string;
  content: string;
  messageType: 'TEXT' | 'VOICE' | 'IMAGE' | 'DOCUMENT' | 'LOCATION' | 'ALERT' | 'SYSTEM';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  attachments?: MessageAttachment[];
  relatedLoadId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface MessageAttachment {
  id: string;
  type: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO';
  filename: string;
  url: string;
  size: number;
  thumbnailUrl?: string;
}

interface Conversation {
  id: string;
  title: string;
  type: 'DIRECT' | 'GROUP' | 'BROADCAST' | 'LOAD_SPECIFIC';
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  relatedLoadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationParticipant {
  id: string;
  name: string;
  role: 'DRIVER' | 'DISPATCHER' | 'ADMIN' | 'CUSTOMER' | 'SYSTEM';
  online: boolean;
  lastSeen?: Date;
  avatar?: string;
}

interface QuickResponse {
  id: string;
  text: string;
  category: 'STATUS' | 'ARRIVAL' | 'ISSUE' | 'QUESTION' | 'CONFIRMATION';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
}

const DriverCommunication: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { loads } = useLoad();

  const [selectedTab, setSelectedTab] = useState<'messages' | 'calls' | 'alerts'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Mock data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv1',
      title: 'Dispatch Center',
      type: 'DIRECT',
      participants: [
        {
          id: 'DISP001',
          name: 'Sarah Johnson',
          role: 'DISPATCHER',
          online: true
        }
      ],
      lastMessage: {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'DISP001',
        senderName: 'Sarah Johnson',
        senderRole: 'DISPATCHER',
        content: 'Your next pickup is ready. Please confirm ETA.',
        messageType: 'TEXT',
        priority: 'NORMAL',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        acknowledged: false
      },
      unreadCount: 2,
      muted: false,
      pinned: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 'conv2',
      title: 'Load WG24-4578',
      type: 'LOAD_SPECIFIC',
      participants: [
        {
          id: 'DISP001',
          name: 'Sarah Johnson',
          role: 'DISPATCHER',
          online: true
        },
        {
          id: 'CUST001',
          name: 'ABC Logistics',
          role: 'CUSTOMER',
          online: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ],
      lastMessage: {
        id: 'msg2',
        conversationId: 'conv2',
        senderId: 'CUST001',
        senderName: 'ABC Logistics',
        senderRole: 'CUSTOMER',
        content: 'Please call when you arrive at the loading dock.',
        messageType: 'TEXT',
        priority: 'NORMAL',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true,
        acknowledged: false
      },
      unreadCount: 0,
      muted: false,
      pinned: false,
      relatedLoadId: 'LD4578',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 45 * 60 * 1000)
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'DISP001',
      senderName: 'Sarah Johnson',
      senderRole: 'DISPATCHER',
      content: 'Your next pickup is ready. Please confirm ETA.',
      messageType: 'TEXT',
      priority: 'NORMAL',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      acknowledged: false
    },
    {
      id: 'msg2',
      conversationId: 'conv1',
      senderId: 'DISP001',
      senderName: 'Sarah Johnson',
      senderRole: 'DISPATCHER',
      content: 'Load WG24-4578: Pickup at 2:00 PM, Deliver by 8:00 AM tomorrow',
      messageType: 'TEXT',
      priority: 'HIGH',
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      read: false,
      acknowledged: false,
      relatedLoadId: 'LD4578'
    }
  ]);

  const quickResponses: QuickResponse[] = [
    { id: 'qr1', text: 'On my way', category: 'STATUS', priority: 'NORMAL' },
    { id: 'qr2', text: 'Arrived at pickup', category: 'ARRIVAL', priority: 'NORMAL' },
    { id: 'qr3', text: 'Loading complete', category: 'STATUS', priority: 'NORMAL' },
    { id: 'qr4', text: 'Delivered successfully', category: 'STATUS', priority: 'NORMAL' },
    { id: 'qr5', text: 'Running 30 minutes late', category: 'STATUS', priority: 'HIGH' },
    { id: 'qr6', text: 'Need assistance', category: 'ISSUE', priority: 'HIGH' },
    { id: 'qr7', text: 'Traffic delay', category: 'ISSUE', priority: 'NORMAL' },
    { id: 'qr8', text: 'Taking mandatory break', category: 'STATUS', priority: 'NORMAL' },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const sendMessage = (content: string, priority: Message['priority'] = 'NORMAL') => {
    if (!content.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation,
      senderId: user?.id || 'current_driver',
      senderName: user?.firstName + ' ' + user?.lastName || 'Driver',
      senderRole: 'DRIVER',
      content: content.trim(),
      messageType: 'TEXT',
      priority,
      timestamp: new Date(),
      read: true,
      acknowledged: false
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setShowQuickResponses(false);

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, lastMessage: newMsg, updatedAt: new Date() }
          : conv
      )
    );
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const acknowledgeMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, acknowledged: true, read: true } : msg
      )
    );
  };

  const getMessageIcon = (type: Message['messageType']) => {
    switch (type) {
      case 'TEXT': return MessageSquare;
      case 'VOICE': return Mic;
      case 'IMAGE': return Camera;
      case 'DOCUMENT': return Paperclip;
      case 'LOCATION': return 'map-marker';
      case 'ALERT': return AlertTriangle;
      case 'SYSTEM': return Settings;
      default: return MessageSquare;
    }
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'URGENT': return theme.colors.error;
      case 'HIGH': return theme.colors.primary;
      case 'NORMAL': return theme.colors.onSurface;
      case 'LOW': return theme.colors.outline;
      default: return theme.colors.onSurface;
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Card 
      style={{ 
        margin: 8, 
        backgroundColor: selectedConversation === item.id ? theme.colors.primaryContainer : theme.colors.surface 
      }}
      onPress={() => setSelectedConversation(item.id)}
    >
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar.Text 
            size={48} 
            label={item.title.substring(0, 2).toUpperCase()}
            style={{ 
              backgroundColor: item.type === 'LOAD_SPECIFIC' ? theme.colors.secondary : theme.colors.primary 
            }}
          />
          
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {item.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.pinned && <IconButton icon="pin" size={16} />}
                {item.muted && <IconButton icon={BellOff} size={16} />}
                {item.unreadCount > 0 && (
                  <Badge style={{ backgroundColor: theme.colors.error }}>
                    {item.unreadCount}
                  </Badge>
                )}
              </View>
            </View>
            
            {item.lastMessage && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text 
                  variant="bodySmall" 
                  style={{ 
                    flex: 1,
                    color: item.unreadCount > 0 ? theme.colors.primary : theme.colors.onSurface,
                    opacity: item.unreadCount > 0 ? 1 : 0.7,
                    fontWeight: item.unreadCount > 0 ? 'bold' : 'normal'
                  }}
                  numberOfLines={1}
                >
                  {item.lastMessage.senderName}: {item.lastMessage.content}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.6, marginLeft: 8 }}>
                  {item.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
            
            {item.participants.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Users size={12} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.primary }}>
                  {item.participants.length} participant{item.participants.length > 1 ? 's' : ''}
                </Text>
                {item.participants.some(p => p.online) && (
                  <View style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: 4, 
                    backgroundColor: '#4caf50', 
                    marginLeft: 8 
                  }} />
                )}
              </View>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id || item.senderRole === 'DRIVER';
    const IconComponent = getMessageIcon(item.messageType);
    
    return (
      <View style={{ 
        margin: 8,
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
      }}>
        <Card style={{ 
          maxWidth: '80%',
          backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surfaceVariant,
          borderRadius: 16
        }}>
          <Card.Content style={{ padding: 12 }}>
            {!isOwnMessage && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text variant="bodySmall" style={{ 
                  color: theme.colors.primary, 
                  fontWeight: 'bold' 
                }}>
                  {item.senderName}
                </Text>
                <Chip 
                  mode="outlined" 
                  compact
                  textStyle={{ fontSize: 8 }}
                  style={{ marginLeft: 8, height: 20 }}
                >
                  {item.senderRole}
                </Chip>
              </View>
            )}
            
            <Text variant="bodyMedium" style={{ 
              color: isOwnMessage ? theme.colors.onPrimary : theme.colors.onSurface 
            }}>
              {item.content}
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 8 
            }}>
              <Text variant="bodySmall" style={{ 
                color: isOwnMessage ? theme.colors.onPrimary : theme.colors.onSurface,
                opacity: 0.7
              }}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.priority !== 'NORMAL' && (
                  <Chip 
                    mode="outlined" 
                    compact
                    textStyle={{ fontSize: 8 }}
                    style={{ 
                      marginLeft: 8, 
                      height: 18,
                      borderColor: getPriorityColor(item.priority)
                    }}
                  >
                    {item.priority}
                  </Chip>
                )}
                
                {!item.read && !isOwnMessage && (
                  <View style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: 4, 
                    backgroundColor: theme.colors.primary, 
                    marginLeft: 8 
                  }} />
                )}
                
                {item.acknowledged && (
                  <CheckCircle size={12} color={theme.colors.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
            </View>
            
            {!isOwnMessage && !item.acknowledged && item.priority !== 'LOW' && (
              <Button 
                mode="text" 
                compact 
                onPress={() => acknowledgeMessage(item.id)}
                style={{ marginTop: 8 }}
              >
                Acknowledge
              </Button>
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = messages.filter(m => m.conversationId === selectedConversation);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {!selectedConversation ? (
        // Conversations List
        <View style={{ flex: 1 }}>
          <Surface style={{ padding: 16, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                Messages
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <IconButton 
                  icon={soundEnabled ? Volume2 : VolumeX} 
                  onPress={() => setSoundEnabled(!soundEnabled)}
                />
                <IconButton 
                  icon={Settings} 
                  onPress={() => setSettingsVisible(true)}
                />
              </View>
            </View>
            
            <Searchbar
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginTop: 16 }}
            />
          </Surface>

          <FlatList
            data={filteredConversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <FAB
            icon={Plus}
            style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
            onPress={() => Alert.alert('New Message', 'Feature coming soon')}
          />
        </View>
      ) : (
        // Conversation View
        <View style={{ flex: 1 }}>
          <Surface style={{ padding: 16, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton 
                icon="arrow-left" 
                onPress={() => setSelectedConversation(null)}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                  {selectedConv?.title}
                </Text>
                {selectedConv?.participants && (
                  <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                    {selectedConv.participants.map(p => p.name).join(', ')}
                  </Text>
                )}
              </View>
              <IconButton icon={Phone} onPress={() => Alert.alert('Call', 'Feature coming soon')} />
              <IconButton icon={MoreVertical} onPress={() => {}} />
            </View>
          </Surface>

          <FlatList
            data={conversationMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 16 }}
          />

          {/* Quick Responses */}
          {showQuickResponses && (
            <Surface style={{ padding: 16, elevation: 4 }}>
              <Text variant="titleSmall" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                Quick Responses
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {quickResponses.map((response) => (
                  <Chip
                    key={response.id}
                    onPress={() => sendMessage(response.text, response.priority)}
                    style={{ margin: 4 }}
                    mode="outlined"
                  >
                    {response.text}
                  </Chip>
                ))}
              </View>
            </Surface>
          )}

          {/* Message Input */}
          <Surface style={{ padding: 16, elevation: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton 
                icon="lightning-bolt" 
                onPress={() => setShowQuickResponses(!showQuickResponses)}
              />
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                style={{ flex: 1, marginHorizontal: 8 }}
                multiline
                right={
                  <TextInput.Icon 
                    icon={Send} 
                    onPress={() => sendMessage(newMessage)}
                    disabled={!newMessage.trim()}
                  />
                }
              />
              <IconButton icon={Mic} onPress={() => Alert.alert('Voice Message', 'Feature coming soon')} />
              <IconButton icon={Camera} onPress={() => Alert.alert('Photo', 'Feature coming soon')} />
            </View>
          </Surface>
        </View>
      )}

      {/* Settings Dialog */}
      <Portal>
        <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
          <Dialog.Title>Communication Settings</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="Sound Notifications"
              right={() => (
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                />
              )}
            />
            <List.Item
              title="Vibration"
              right={() => (
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSettingsVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default DriverCommunication;
