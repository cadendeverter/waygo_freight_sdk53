// waygo-freight/app/(admin)/customers/communications.tsx
import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, FlatList } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  TextInput,
  IconButton,
  Menu,
  Badge,
  Divider,
  FAB,
  SegmentedButtons,
  Modal,
  Portal
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  MessageSquare,
  Phone,
  Mail,
  Bell,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Star,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Paperclip,
  Smile,
  Archive,
  Flag
} from '../../../utils/icons';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive';
  lastActivity: Date;
  totalLoads: number;
  rating: number;
}

interface Communication {
  id: string;
  customerId: string;
  type: 'sms' | 'email' | 'phone' | 'in_app' | 'automated';
  direction: 'inbound' | 'outbound';
  subject?: string;
  message: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  attachments?: string[];
  loadNumber?: string;
  isRead: boolean;
  threadId: string;
  agentId?: string;
  responseTime?: number; // minutes
}

interface CommunicationTemplate {
  id: string;
  name: string;
  category: 'delivery' | 'pickup' | 'delay' | 'general' | 'promotional';
  subject: string;
  content: string;
  type: 'sms' | 'email';
  variables: string[];
  isActive: boolean;
}

const CustomerCommunications = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'urgent' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Mock customers data
  const customers: Customer[] = [
    {
      id: '1',
      name: 'John Smith',
      company: 'ABC Logistics',
      email: 'john@abclogistics.com',
      phone: '+1-555-0123',
      status: 'active',
      lastActivity: new Date('2024-01-15T14:30:00'),
      totalLoads: 45,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'Global Supply Chain',
      email: 'sarah@globalsupply.com',
      phone: '+1-555-0124',
      status: 'active',
      lastActivity: new Date('2024-01-15T12:15:00'),
      totalLoads: 23,
      rating: 4.6
    }
  ];

  // Mock communications data
  const communications: Communication[] = [
    {
      id: '1',
      customerId: '1',
      type: 'sms',
      direction: 'inbound',
      message: 'Hi, can you provide an update on load #WG-2024-001? The delivery is scheduled for today.',
      timestamp: new Date('2024-01-15T14:30:00'),
      status: 'delivered',
      priority: 'normal',
      tags: ['load_inquiry', 'delivery'],
      loadNumber: 'WG-2024-001',
      isRead: false,
      threadId: 'thread-1',
      responseTime: 15
    },
    {
      id: '2',
      customerId: '1',
      type: 'sms',
      direction: 'outbound',
      message: 'Hi John! Load #WG-2024-001 is currently in transit and on schedule for delivery today by 3 PM. The driver will call 30 minutes before arrival.',
      timestamp: new Date('2024-01-15T14:45:00'),
      status: 'delivered',
      priority: 'normal',
      tags: ['load_update', 'delivery'],
      loadNumber: 'WG-2024-001',
      isRead: true,
      threadId: 'thread-1',
      agentId: 'agent-1'
    },
    {
      id: '3',
      customerId: '2',
      type: 'email',
      direction: 'outbound',
      subject: 'Delivery Confirmation - Load #WG-2024-002',
      message: 'Your shipment has been successfully delivered. Please find the POD and invoice attached.',
      timestamp: new Date('2024-01-15T10:20:00'),
      status: 'read',
      priority: 'normal',
      tags: ['delivery_confirmation', 'pod'],
      loadNumber: 'WG-2024-002',
      isRead: true,
      threadId: 'thread-2',
      agentId: 'agent-2',
      attachments: ['POD_WG-2024-002.pdf', 'Invoice_WG-2024-002.pdf']
    },
    {
      id: '4',
      customerId: '2',
      type: 'in_app',
      direction: 'inbound',
      message: 'We need to reschedule pickup for tomorrow morning due to dock availability. Is this possible?',
      timestamp: new Date('2024-01-14T16:45:00'),
      status: 'delivered',
      priority: 'high',
      tags: ['reschedule', 'pickup'],
      loadNumber: 'WG-2024-003',
      isRead: false,
      threadId: 'thread-3'
    }
  ];

  // Mock templates
  const templates: CommunicationTemplate[] = [
    {
      id: '1',
      name: 'Delivery Notification',
      category: 'delivery',
      subject: 'Your shipment is out for delivery',
      content: 'Hi {{customer_name}}, your load {{load_number}} is currently out for delivery and will arrive at approximately {{estimated_time}}.',
      type: 'sms',
      variables: ['customer_name', 'load_number', 'estimated_time'],
      isActive: true
    },
    {
      id: '2',
      name: 'Delay Notification',
      category: 'delay',
      subject: 'Delivery Update - {{load_number}}',
      content: 'We want to keep you informed that there is a slight delay with your shipment {{load_number}}. New estimated delivery: {{new_eta}}. Reason: {{delay_reason}}',
      type: 'email',
      variables: ['load_number', 'new_eta', 'delay_reason'],
      isActive: true
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getCustomerById = (customerId: string) => 
    customers.find(c => c.id === customerId);

  const getStatusColor = (status: Communication['status']) => {
    switch (status) {
      case 'sent': return '#2196F3';
      case 'delivered': return '#4CAF50';
      case 'read': return '#9C27B0';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: Communication['priority']) => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'normal': return '#4CAF50';
      case 'low': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getTypeIcon = (type: Communication['type']) => {
    switch (type) {
      case 'sms': return MessageSquare;
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'in_app': return Bell;
      case 'automated': return Truck;
      default: return MessageSquare;
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = searchQuery === '' || 
      comm.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.loadNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerById(comm.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'unread' && !comm.isRead) ||
      (selectedFilter === 'urgent' && ['urgent', 'high'].includes(comm.priority)) ||
      (selectedFilter === 'recent' && new Date().getTime() - comm.timestamp.getTime() < 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesFilter;
  });

  const renderKPICard = (title: string, value: string, subtitle: string, icon: any, color: string) => (
    <Card mode="elevated" style={{ flex: 1, margin: 4 }}>
      <Card.Content style={{ alignItems: 'center', padding: 12 }}>
        <View style={{ 
          backgroundColor: color + '20', 
          padding: 8, 
          borderRadius: 20, 
          marginBottom: 8 
        }}>
          {React.createElement(icon, { size: 24, color })}
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {subtitle}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderCommunicationCard = (communication: Communication) => {
    const customer = getCustomerById(communication.customerId);
    const TypeIcon = getTypeIcon(communication.type);
    const statusColor = getStatusColor(communication.status);
    
    return (
      <Card 
        key={communication.id} 
        mode="elevated" 
        style={{ 
          marginBottom: 12,
          borderLeftWidth: communication.isRead ? 0 : 4,
          borderLeftColor: communication.isRead ? 'transparent' : theme.colors.primary
        }}
      >
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ 
                backgroundColor: theme.colors.primaryContainer,
                padding: 8,
                borderRadius: 20,
                marginRight: 12
              }}>
                <TypeIcon size={20} color={theme.colors.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold', flex: 1 }}>
                    {customer?.name} • {customer?.company}
                  </Text>
                  {!communication.isRead && (
                    <Badge style={{ backgroundColor: theme.colors.primary, marginLeft: 8 }} />
                  )}
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {communication.direction === 'inbound' ? 'Received' : 'Sent'} • {communication.timestamp.toLocaleString()}
                </Text>
              </View>
            </View>
            
            <Menu
              visible={activeMenuId === communication.id}
              onDismiss={() => setActiveMenuId(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={18}
                  onPress={() => setActiveMenuId(communication.id)}
                />
              }
            >
              <Menu.Item 
                onPress={() => {
                  console.log('Reply to message');
                  setActiveMenuId(null);
                }} 
                title="Reply" 
                leadingIcon="reply"
              />
              <Menu.Item 
                onPress={() => {
                  console.log('Forward message');
                  setActiveMenuId(null);
                }} 
                title="Forward" 
                leadingIcon="share"
              />
              <Divider />
              <Menu.Item 
                onPress={() => {
                  console.log('Mark as important');
                  setActiveMenuId(null);
                }} 
                title="Flag" 
                leadingIcon="flag"
              />
              <Menu.Item 
                onPress={() => {
                  console.log('Archive message');
                  setActiveMenuId(null);
                }} 
                title="Archive" 
                leadingIcon="archive"
              />
            </Menu>
          </View>

          {/* Subject (for emails) */}
          {communication.subject && (
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 6 }}>
              {communication.subject}
            </Text>
          )}

          {/* Message Content */}
          <Text variant="bodyMedium" style={{ marginBottom: 12, lineHeight: 20 }}>
            {communication.message}
          </Text>

          {/* Tags and Load Number */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {communication.loadNumber && (
              <Chip 
                mode="outlined" 
                compact
                textStyle={{ fontSize: 11 }}
                style={{ backgroundColor: theme.colors.secondaryContainer + '40' }}
                icon={() => <Package size={12} color={theme.colors.secondary} />}
              >
                {communication.loadNumber}
              </Chip>
            )}
            
            <Chip 
              mode="outlined" 
              compact
              textStyle={{ fontSize: 11 }}
              style={{ 
                backgroundColor: getPriorityColor(communication.priority) + '20',
                borderColor: getPriorityColor(communication.priority)
              }}
            >
              {communication.priority.toUpperCase()}
            </Chip>
            
            {communication.tags.map((tag, index) => (
              <Chip 
                key={index}
                mode="outlined" 
                compact
                textStyle={{ fontSize: 11 }}
                style={{ backgroundColor: theme.colors.surfaceVariant }}
              >
                {tag.replace('_', ' ')}
              </Chip>
            ))}
          </View>

          {/* Attachments */}
          {communication.attachments && communication.attachments.length > 0 && (
            <View style={{ 
              backgroundColor: theme.colors.surfaceVariant,
              padding: 8,
              borderRadius: 6,
              marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Paperclip size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={{ marginLeft: 4, fontWeight: 'bold' }}>
                  Attachments ({communication.attachments.length})
                </Text>
              </View>
              {communication.attachments.map((attachment, index) => (
                <Text key={index} variant="bodySmall" style={{ color: theme.colors.primary, marginLeft: 20 }}>
                  {attachment}
                </Text>
              ))}
            </View>
          )}

          {/* Status and Response Time */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Chip 
                mode="outlined" 
                compact
                textStyle={{ fontSize: 11 }}
                style={{ 
                  backgroundColor: statusColor + '20',
                  borderColor: statusColor
                }}
              >
                {communication.status.toUpperCase()}
              </Chip>
              
              {communication.responseTime && (
                <Text variant="bodySmall" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                  Response time: {communication.responseTime}m
                </Text>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button 
                mode="outlined" 
                compact
                onPress={() => console.log('Reply to communication')}
              >
                Reply
              </Button>
              {communication.direction === 'inbound' && !communication.isRead && (
                <Button 
                  mode="contained" 
                  compact
                  onPress={() => console.log('Mark as read')}
                >
                  Mark Read
                </Button>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Calculate summary metrics
  const totalCommunications = communications.length;
  const unreadCount = communications.filter(c => !c.isRead).length;
  const avgResponseTime = Math.round(
    communications.filter(c => c.responseTime).reduce((sum, c) => sum + (c.responseTime || 0), 0) / 
    communications.filter(c => c.responseTime).length
  );
  const todayCount = communications.filter(c => {
    const today = new Date();
    return c.timestamp.toDateString() === today.toDateString();
  }).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
            Customer Communications
          </Text>
          <Button 
            mode="contained"
            icon="plus"
            onPress={() => setShowNewMessageModal(true)}
          >
            New Message
          </Button>
        </View>

        {/* Summary KPIs */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {renderKPICard(
            'Total Messages',
            totalCommunications.toString(),
            'All communications',
            MessageSquare,
            '#2196F3'
          )}
          {renderKPICard(
            'Unread',
            unreadCount.toString(),
            'Require attention',
            Bell,
            unreadCount > 0 ? '#F44336' : '#4CAF50'
          )}
          {renderKPICard(
            'Avg Response',
            `${avgResponseTime}m`,
            'Response time',
            Clock,
            '#FF9800'
          )}
          {renderKPICard(
            'Today',
            todayCount.toString(),
            'Messages today',
            Star,
            '#9C27B0'
          )}
        </View>

        {/* Search and Filters */}
        <View style={{ marginBottom: 16 }}>
          <TextInput
            mode="outlined"
            label="Search communications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={<TextInput.Icon icon="magnify" />}
            style={{ marginBottom: 12 }}
          />
          
          <SegmentedButtons
            value={selectedFilter}
            onValueChange={(value) => setSelectedFilter(value as any)}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'recent', label: 'Recent' }
            ]}
          />
        </View>

        {/* Communications List */}
        {filteredCommunications.map(renderCommunicationCard)}

        {/* Empty State */}
        {filteredCommunications.length === 0 && (
          <Card mode="elevated" style={{ marginTop: 20 }}>
            <Card.Content style={{ alignItems: 'center', padding: 40 }}>
              <MessageSquare size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
                No communications found
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Start a conversation with your customers'}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="message-plus"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={() => setShowNewMessageModal(true)}
      />

      {/* New Message Modal */}
      <Portal>
        <Modal 
          visible={showNewMessageModal} 
          onDismiss={() => setShowNewMessageModal(false)}
          contentContainerStyle={{ 
            backgroundColor: theme.colors.surface, 
            margin: 20, 
            padding: 20, 
            borderRadius: 8 
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            New Message
          </Text>
          <Text variant="bodyMedium">
            New message composition interface would go here...
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
            <Button onPress={() => setShowNewMessageModal(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={() => setShowNewMessageModal(false)}>
              Send
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

export default CustomerCommunications;
