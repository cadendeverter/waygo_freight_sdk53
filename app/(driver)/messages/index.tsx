import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  List,
  Surface,
  TextInput,
  IconButton,
  Badge,
  Divider,
  Portal,
  Dialog,
  FAB
} from 'react-native-paper';
import {
  MessageSquare,
  Send,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Truck,
  MapPin,
  Calendar,
  Camera,
  Paperclip,
  Bell,
  Settings
} from '../../../utils/icons';
import { useAuth } from '../../../state/authContext';

interface Message {
  id: string;
  type: 'text' | 'system' | 'alert' | 'location' | 'image';
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    role: 'driver' | 'dispatch' | 'system';
  };
  read: boolean;
  urgent: boolean;
  loadNumber?: string;
  imageUri?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  type: 'dispatch' | 'load_specific' | 'emergency' | 'general';
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  priority: 'normal' | 'high' | 'urgent';
  loadNumber?: string;
}

export default function DriverMessages() {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [quickReplyVisible, setQuickReplyVisible] = useState(false);
  const [emergencyDialogVisible, setEmergencyDialogVisible] = useState(false);
  
  // Mock conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Dispatch Center',
      type: 'dispatch',
      participants: ['dispatch', 'driver'],
      lastMessage: {
        id: '1',
        type: 'text',
        content: 'Please provide ETA for Load WG-2024-001',
        timestamp: new Date('2024-01-20T10:30:00'),
        sender: {
          id: 'dispatch1',
          name: 'Alex Rodriguez',
          role: 'dispatch'
        },
        read: false,
        urgent: false,
        loadNumber: 'WG-2024-001'
      },
      unreadCount: 2,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Load WG-2024-001',
      type: 'load_specific',
      participants: ['dispatch', 'driver', 'customer'],
      lastMessage: {
        id: '2',
        type: 'alert',
        content: 'Delivery appointment confirmed for 2:00 PM',
        timestamp: new Date('2024-01-20T09:15:00'),
        sender: {
          id: 'system',
          name: 'System',
          role: 'system'
        },
        read: true,
        urgent: false,
        loadNumber: 'WG-2024-001'
      },
      unreadCount: 0,
      priority: 'normal',
      loadNumber: 'WG-2024-001'
    },
    {
      id: '3',
      title: 'Emergency Support',
      type: 'emergency',
      participants: ['emergency', 'driver'],
      lastMessage: {
        id: '3',
        type: 'system',
        content: 'Emergency support available 24/7',
        timestamp: new Date('2024-01-19T08:00:00'),
        sender: {
          id: 'system',
          name: 'System',
          role: 'system'
        },
        read: true,
        urgent: false
      },
      unreadCount: 0,
      priority: 'urgent'
    }
  ]);

  // Mock messages for selected conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'text',
      content: 'Good morning! You have a new load assignment: WG-2024-001',
      timestamp: new Date('2024-01-20T08:00:00'),
      sender: {
        id: 'dispatch1',
        name: 'Alex Rodriguez',
        role: 'dispatch'
      },
      read: true,
      urgent: false,
      loadNumber: 'WG-2024-001'
    },
    {
      id: '2',
      type: 'text',
      content: 'Got it. Heading to pickup location now.',
      timestamp: new Date('2024-01-20T08:05:00'),
      sender: {
        id: 'driver1',
        name: (user?.firstName + ' ' + user?.lastName) || 'John Driver',
        role: 'driver'
      },
      read: true,
      urgent: false
    },
    {
      id: '3',
      type: 'location',
      content: 'Current location shared',
      timestamp: new Date('2024-01-20T09:30:00'),
      sender: {
        id: 'driver1',
        name: (user?.firstName + ' ' + user?.lastName) || 'John Driver',
        role: 'driver'
      },
      read: true,
      urgent: false,
      location: {
        lat: 34.0522,
        lng: -118.2437,
        address: '1234 Industrial Blvd, Los Angeles, CA'
      }
    },
    {
      id: '4',
      type: 'alert',
      content: 'Traffic delay on I-10. ETA updated to 11:30 AM',
      timestamp: new Date('2024-01-20T10:00:00'),
      sender: {
        id: 'system',
        name: 'System',
        role: 'system'
      },
      read: true,
      urgent: true
    },
    {
      id: '5',
      type: 'text',
      content: 'Please provide ETA for Load WG-2024-001',
      timestamp: new Date('2024-01-20T10:30:00'),
      sender: {
        id: 'dispatch1',
        name: 'Alex Rodriguez',
        role: 'dispatch'
      },
      read: false,
      urgent: false,
      loadNumber: 'WG-2024-001'
    }
  ]);

  const quickReplies = [
    'On my way',
    'Arrived at pickup',
    'Loaded and departing',
    'En route to delivery',
    'Delivered successfully',
    'Running 15 minutes late',
    'Need assistance',
    'All good'
  ];

  const sendMessage = (content: string, type: Message['type'] = 'text') => {
    if (!content.trim() && type === 'text') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      sender: {
        id: user?.id || 'driver1',
        name: (user?.firstName + ' ' + user?.lastName) || 'John Driver',
        role: 'driver'
      },
      read: true,
      urgent: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Update conversation's last message
    if (selectedConversation) {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, lastMessage: newMessage }
            : conv
        )
      );
    }
  };

  const sendQuickReply = (reply: string) => {
    sendMessage(reply);
    setQuickReplyVisible(false);
  };

  const shareLocation = () => {
    const locationMessage = {
      id: Date.now().toString(),
      type: 'location' as const,
      content: 'Current location shared',
      timestamp: new Date(),
      sender: {
        id: user?.id || 'driver1',
        name: (user?.firstName + ' ' + user?.lastName) || 'John Driver',
        role: 'driver' as const
      },
      read: true,
      urgent: false,
      location: {
        lat: 34.0522,
        lng: -118.2437,
        address: '1234 Industrial Blvd, Los Angeles, CA'
      }
    };

    setMessages(prev => [...prev, locationMessage]);
    Alert.alert('Location Shared', 'Your current location has been shared with dispatch.');
  };

  const callEmergency = () => {
    setEmergencyDialogVisible(true);
  };

  const handleEmergencyCall = (type: string) => {
    setEmergencyDialogVisible(false);
    Alert.alert('Emergency Call', `Connecting to ${type}...`);
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'dispatch':
        return User;
      case 'load_specific':
        return Truck;
      case 'emergency':
        return AlertTriangle;
      default:
        return MessageSquare;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#F44336';
      case 'high':
        return '#FF9800';
      default:
        return '#4CAF50';
    }
  };

  const getMessageBubbleStyle = (sender: Message['sender']): { [key: string]: any } => {
    const isDriver = sender.role === 'driver';
    return {
      ...styles.messageBubble,
      backgroundColor: isDriver ? theme.colors.primary : '#f0f0f0',
      alignSelf: isDriver ? 'flex-end' as const : 'flex-start' as const,
      marginLeft: isDriver ? 50 : 0,
      marginRight: isDriver ? 0 : 50,
    };
  };

  const getMessageTextStyle = (sender: Message['sender']) => {
    return {
      color: sender.role === 'driver' ? '#fff' : '#000',
    };
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Header */}
        <Surface style={styles.chatHeader}>
          <IconButton
            icon={() => <MessageSquare size={20} color={theme.colors.primary} />}
            onPress={() => setSelectedConversation(null)}
          />
          <View style={styles.chatHeaderInfo}>
            <Text variant="titleMedium" style={styles.chatTitle}>
              {conversation?.title}
            </Text>
            {conversation?.loadNumber && (
              <Text variant="bodySmall" style={styles.chatSubtitle}>
                {conversation.loadNumber}
              </Text>
            )}
          </View>
          <IconButton
            icon={() => <Phone size={20} color={theme.colors.primary} />}
            onPress={() => Alert.alert('Call', 'Calling dispatch...')}
          />
        </Surface>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer}>
          {messages.map(message => (
            <View key={message.id} style={styles.messageContainer}>
              <Surface style={getMessageBubbleStyle(message.sender)}>
                {message.type === 'location' ? (
                  <View style={styles.locationMessage}>
                    <MapPin size={16} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={styles.locationText}>
                      {message.location?.address}
                    </Text>
                  </View>
                ) : message.type === 'alert' ? (
                  <View style={styles.alertMessage}>
                    <AlertTriangle size={16} color="#FF9800" />
                    <Text variant="bodySmall" style={styles.alertText}>
                      {message.content}
                    </Text>
                  </View>
                ) : (
                  <Text variant="bodyMedium" style={getMessageTextStyle(message.sender)}>
                    {message.content}
                  </Text>
                )}
                
                <Text variant="bodySmall" style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString()}
                </Text>
              </Surface>
            </View>
          ))}
        </ScrollView>

        {/* Quick Replies */}
        {quickReplyVisible && (
          <ScrollView horizontal style={styles.quickRepliesContainer}>
            {quickReplies.map(reply => (
              <Chip
                key={reply}
                onPress={() => sendQuickReply(reply)}
                style={styles.quickReplyChip}
              >
                {reply}
              </Chip>
            ))}
          </ScrollView>
        )}

        {/* Message Input */}
        <Surface style={styles.messageInputContainer}>
          <IconButton
            icon={() => <Paperclip size={20} color={theme.colors.primary} />}
            onPress={() => setQuickReplyVisible(!quickReplyVisible)}
          />
          <TextInput
            mode="outlined"
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            style={styles.messageInput}
            multiline
            maxLength={500}
          />
          <IconButton
            icon={() => <Camera size={20} color={theme.colors.primary} />}
            onPress={shareLocation}
          />
          <IconButton
            icon={() => <Send size={20} color={theme.colors.primary} />}
            onPress={() => sendMessage(messageText)}
            disabled={!messageText.trim()}
          />
        </Surface>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header}>
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={styles.title}>Messages</Text>
            {totalUnread > 0 && (
              <Badge style={styles.unreadBadge}>{totalUnread}</Badge>
            )}
          </View>
          <IconButton
            icon={() => <Settings size={20} color={theme.colors.primary} />}
            onPress={() => Alert.alert('Settings', 'Message settings')}
          />
        </Surface>

        {/* Emergency Contact */}
        <Card style={styles.emergencyCard}>
          <Card.Content>
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyInfo}>
                <AlertTriangle size={24} color="#F44336" />
                <Text variant="titleMedium" style={styles.emergencyTitle}>
                  Emergency Support
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={callEmergency}
                style={styles.emergencyButton}
              >
                Call Now
              </Button>
            </View>
            <Text variant="bodySmall" style={styles.emergencyDescription}>
              24/7 emergency support for breakdowns, accidents, or urgent assistance
            </Text>
          </Card.Content>
        </Card>

        {/* Conversations */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Conversations</Text>
            
            {conversations.map(conversation => (
              <List.Item
                key={conversation.id}
                title={conversation.title}
                description={conversation.lastMessage.content}
                left={() => (
                  <Surface style={styles.conversationIcon}>
                    {React.createElement(getConversationIcon(conversation.type), {
                      size: 20,
                      color: getPriorityColor(conversation.priority)
                    })}
                  </Surface>
                )}
                right={() => (
                  <View style={styles.conversationMeta}>
                    <Text variant="bodySmall" style={styles.conversationTime}>
                      {conversation.lastMessage.timestamp.toLocaleTimeString()}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <Badge style={styles.conversationBadge}>
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </View>
                )}
                onPress={() => setSelectedConversation(conversation.id)}
                style={styles.conversationItem}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                onPress={shareLocation}
                icon={() => <MapPin size={16} color={theme.colors.primary} />}
                style={styles.quickActionButton}
              >
                Share Location
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Status Update', 'Send status update to dispatch')}
                icon={() => <Truck size={16} color={theme.colors.primary} />}
                style={styles.quickActionButton}
              >
                Status Update
              </Button>
            </View>

            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Photo', 'Take and send photo')}
                icon={() => <Camera size={16} color={theme.colors.primary} />}
                style={styles.quickActionButton}
              >
                Send Photo
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Schedule', 'Request schedule change')}
                icon={() => <Calendar size={16} color={theme.colors.primary} />}
                style={styles.quickActionButton}
              >
                Schedule Change
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Message Guidelines */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Communication Guidelines</Text>
            
            <List.Item
              title="Response Time"
              description="Respond to dispatch messages within 30 minutes"
              left={() => <Clock size={24} color="#4CAF50" />}
            />
            
            <List.Item
              title="Emergency Protocol"
              description="Use emergency button for immediate assistance"
              left={() => <AlertTriangle size={24} color="#F44336" />}
            />
            
            <List.Item
              title="Status Updates"
              description="Provide regular updates on load progress"
              left={() => <CheckCircle size={24} color="#2196F3" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Emergency Dialog */}
      <Portal>
        <Dialog visible={emergencyDialogVisible} onDismiss={() => setEmergencyDialogVisible(false)}>
          <Dialog.Title>Emergency Support</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Select the type of emergency:</Text>
            
            <Button
              mode="contained"
              onPress={() => handleEmergencyCall('Breakdown Support')}
              style={styles.emergencyOption}
            >
              Vehicle Breakdown
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleEmergencyCall('Accident Support')}
              style={styles.emergencyOption}
            >
              Accident/Incident
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleEmergencyCall('Medical Emergency')}
              style={styles.emergencyOption}
            >
              Medical Emergency
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => handleEmergencyCall('General Support')}
              style={styles.emergencyOption}
            >
              General Support
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEmergencyDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* New Message FAB */}
      <FAB
        icon={() => <MessageSquare size={24} color="#fff" />}
        style={styles.fab}
        onPress={() => Alert.alert('New Message', 'Start new conversation')}
        label="New Message"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#F44336',
  },
  emergencyCard: {
    margin: 16,
    backgroundColor: '#ffebee',
    elevation: 2,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyTitle: {
    fontWeight: 'bold',
    color: '#F44336',
  },
  emergencyButton: {
    backgroundColor: '#F44336',
  },
  emergencyDescription: {
    opacity: 0.7,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  conversationIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  conversationTime: {
    opacity: 0.7,
  },
  conversationBadge: {
    backgroundColor: '#F44336',
  },
  conversationItem: {
    paddingVertical: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    elevation: 2,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  chatTitle: {
    fontWeight: 'bold',
  },
  chatSubtitle: {
    opacity: 0.7,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  messageTime: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 10,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    flex: 1,
  },
  alertMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontWeight: 'bold',
  },
  quickRepliesContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  quickReplyChip: {
    marginRight: 8,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    elevation: 2,
  },
  messageInput: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  emergencyOption: {
    marginVertical: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});
