import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../theme/ThemeContext';
import Heading from '../components/typography/Heading';
import { 
  Text, 
  Card, 
  Button, 
  IconButton,
  Chip,
  FAB,
  Portal,
  Dialog,
  TextInput
} from 'react-native-paper';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Truck,
  User,
  Settings
} from '../utils/icons';

const { width } = Dimensions.get('window');

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: 'pickup' | 'delivery' | 'maintenance' | 'meeting' | 'inspection';
  location: string;
  driver?: string;
  vehicle?: string;
  loadId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description?: string;
}

const mockEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Pickup - ABC Manufacturing',
    date: '2025-06-19',
    time: '08:00',
    endTime: '09:00',
    type: 'pickup',
    location: 'Dallas, TX',
    driver: 'John Smith',
    vehicle: 'T-001',
    loadId: 'L-2025-145',
    priority: 'high',
    status: 'scheduled',
    description: 'Pickup steel coils - 45,000 lbs'
  },
  {
    id: '2',
    title: 'Delivery - XYZ Warehouse',
    date: '2025-06-19',
    time: '14:30',
    endTime: '15:30',
    type: 'delivery',
    location: 'Houston, TX',
    driver: 'John Smith',
    vehicle: 'T-001',
    loadId: 'L-2025-145',
    priority: 'high',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Preventive Maintenance',
    date: '2025-06-20',
    time: '10:00',
    endTime: '12:00',
    type: 'maintenance',
    location: 'Fleet Services Center',
    vehicle: 'T-003',
    priority: 'medium',
    status: 'scheduled',
    description: 'Oil change and 50k mile service'
  },
  {
    id: '4',
    title: 'Safety Meeting',
    date: '2025-06-21',
    time: '09:00',
    endTime: '10:00',
    type: 'meeting',
    location: 'Main Office',
    priority: 'medium',
    status: 'scheduled'
  },
  {
    id: '5',
    title: 'DOT Inspection',
    date: '2025-06-22',
    time: '13:00',
    endTime: '14:00',
    type: 'inspection',
    location: 'DOT Station - I-35',
    driver: 'Mike Johnson',
    vehicle: 'T-005',
    priority: 'high',
    status: 'scheduled'
  }
];

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>(mockEvents);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const today = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, firstDay, lastDay };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'pickup':
        return '#007AFF';
      case 'delivery':
        return '#34C759';
      case 'maintenance':
        return '#FF9500';
      case 'meeting':
        return '#8E8E93';
      case 'inspection':
        return '#FF3B30';
      default:
        return theme.colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#8E8E93';
      default:
        return theme.colors.outline;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const renderCalendarHeader = () => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface
    }}>
      <IconButton
        icon={() => <ChevronLeft size={24} color={theme.colors.onSurface} />}
        onPress={() => navigateMonth('prev')}
      />
      
      <TouchableOpacity>
        <Text variant="headlineSmall" style={{ fontWeight: '600' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
      </TouchableOpacity>
      
      <IconButton
        icon={() => <ChevronRight size={24} color={theme.colors.onSurface} />}
        onPress={() => navigateMonth('next')}
      />
    </View>
  );

  const renderCalendarGrid = () => {
    const { days } = getMonthData(currentDate);
    const currentMonth = currentDate.getMonth();
    
    return (
      <View style={{ backgroundColor: theme.colors.surface }}>
        {/* Day headers */}
        <View style={{ 
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline
        }}>
          {dayNames.map(day => (
            <View key={day} style={{ flex: 1, alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ 
                color: theme.colors.onSurfaceVariant,
                fontWeight: '600'
              }}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={{ paddingHorizontal: 16 }}>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View key={weekIndex} style={{ flexDirection: 'row' }}>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayDate = days[weekIndex * 7 + dayIndex];
                const isCurrentMonth = dayDate.getMonth() === currentMonth;
                const isToday = dayDate.toDateString() === today.toDateString();
                const isSelected = dayDate.toDateString() === selectedDate.toDateString();
                const dayEvents = getEventsForDate(dayDate);
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={{
                      flex: 1,
                      minHeight: 60,
                      padding: 4,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      backgroundColor: isSelected ? theme.colors.primaryContainer : 'transparent',
                      borderRadius: 8,
                      margin: 1
                    }}
                    onPress={() => setSelectedDate(dayDate)}
                  >
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: isCurrentMonth 
                          ? (isToday ? theme.colors.primary : theme.colors.onSurface)
                          : theme.colors.onSurfaceVariant,
                        fontWeight: isToday ? '700' : '500',
                        marginBottom: 2
                      }}
                    >
                      {dayDate.getDate()}
                    </Text>
                    
                    {/* Event indicators */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dayEvents.slice(0, 3).map((event, index) => (
                        <View
                          key={index}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: getEventTypeColor(event.type),
                            margin: 1
                          }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <Text variant="bodySmall" style={{ 
                          fontSize: 10,
                          color: theme.colors.onSurfaceVariant
                        }}>
                          +{dayEvents.length - 3}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDayEvents = () => {
    const selectedEvents = getEventsForDate(selectedDate);
    
    return (
      <View style={{ padding: 16 }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Text variant="titleLarge" style={{ fontWeight: '600' }}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric'
            })}
          </Text>
          <Chip mode="outlined">
            {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
          </Chip>
        </View>

        {selectedEvents.length === 0 ? (
          <Card>
            <Card.Content style={{ padding: 32, alignItems: 'center' }}>
              <CalendarIcon size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
                No events scheduled
              </Text>
              <Text variant="bodyMedium" style={{ 
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center'
              }}>
                Tap the + button to add a new event
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                onPress={() => {
                  setSelectedEvent(event);
                  setShowEventDialog(true);
                }}
              >
                <Card style={{ marginBottom: 12 }}>
                  <Card.Content>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <View style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: getEventTypeColor(event.type),
                            marginRight: 8
                          }} />
                          <Text variant="titleMedium" style={{ fontWeight: '600', flex: 1 }}>
                            {event.title}
                          </Text>
                          <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: getPriorityColor(event.priority)
                          }} />
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Clock size={14} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodyMedium" style={{ 
                            marginLeft: 6,
                            color: theme.colors.onSurfaceVariant
                          }}>
                            {event.time}{event.endTime && ` - ${event.endTime}`}
                          </Text>
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <MapPin size={14} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodyMedium" style={{ 
                            marginLeft: 6,
                            color: theme.colors.onSurfaceVariant,
                            flex: 1
                          }}>
                            {event.location}
                          </Text>
                        </View>
                        
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                          <Chip mode="outlined" textStyle={{ fontSize: 11 }} style={{ height: 24 }}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Chip>
                          
                          {event.driver && (
                            <Chip mode="outlined" textStyle={{ fontSize: 11 }} style={{ height: 24 }}>
                              {event.driver}
                            </Chip>
                          )}
                          
                          {event.vehicle && (
                            <Chip mode="outlined" textStyle={{ fontSize: 11 }} style={{ height: 24 }}>
                              {event.vehicle}
                            </Chip>
                          )}
                          
                          {event.loadId && (
                            <Chip mode="outlined" textStyle={{ fontSize: 11 }} style={{ height: 24 }}>
                              {event.loadId}
                            </Chip>
                          )}
                        </View>
                        
                        {event.description && (
                          <Text variant="bodySmall" style={{ 
                            marginTop: 8,
                            color: theme.colors.onSurfaceVariant
                          }}>
                            {event.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Schedule',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.onSurface },
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon={() => <Settings size={24} color={theme.colors.onSurface} />}
                onPress={() => {
                  // Settings menu would go here
                }}
              />
            </View>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* View mode selector */}
        <View style={{ 
          flexDirection: 'row', 
          padding: 16, 
          backgroundColor: theme.colors.surface,
          gap: 8 
        }}>
          {['month', 'week', 'day'].map((mode) => (
            <Chip
              key={mode}
              mode={viewMode === mode ? 'flat' : 'outlined'}
              onPress={() => setViewMode(mode as any)}
              style={viewMode === mode ? { backgroundColor: theme.colors.primary } : {}}
              textStyle={viewMode === mode ? { color: '#FFFFFF' } : {}}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Chip>
          ))}
        </View>

        {/* Calendar header */}
        {renderCalendarHeader()}

        {/* Calendar content */}
        <ScrollView style={{ flex: 1 }}>
          {/* Calendar grid */}
          {renderCalendarGrid()}
          
          {/* Selected day events */}
          {renderDayEvents()}
        </ScrollView>
      </View>

      {/* Event details dialog */}
      <Portal>
        <Dialog
          visible={showEventDialog}
          onDismiss={() => setShowEventDialog(false)}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>Event Details</Dialog.Title>
          <Dialog.Content>
            {selectedEvent && (
              <ScrollView>
                <Text variant="titleMedium" style={{ marginBottom: 8, fontWeight: '600' }}>
                  {selectedEvent.title}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Clock size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                    {selectedEvent.time}{selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MapPin size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                    {selectedEvent.location}
                  </Text>
                </View>
                
                {selectedEvent.driver && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <User size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                      Driver: {selectedEvent.driver}
                    </Text>
                  </View>
                )}
                
                {selectedEvent.vehicle && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Truck size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                      Vehicle: {selectedEvent.vehicle}
                    </Text>
                  </View>
                )}
                
                {selectedEvent.description && (
                  <View style={{ marginTop: 16 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: '600' }}>
                      Description
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {selectedEvent.description}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEventDialog(false)}>Close</Button>
            <Button mode="contained">Edit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add event FAB */}
      <FAB
        icon={() => <Plus size={24} color="#FFFFFF" />}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => {
          // Navigate to create event screen
          alert('Create event functionality would be implemented here');
        }}
      />
    </ScreenWrapper>
  );
}
