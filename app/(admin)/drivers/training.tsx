import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme, 
  List, 
  Avatar, 
  Badge, 
  ProgressBar,
  IconButton,
  Surface,
  Searchbar,
  DataTable
} from 'react-native-paper';
import { 
  GraduationCap, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Award,
  BookOpen,
  PlayCircle,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Star
} from '../../../utils/icons';

interface TrainingModule {
  id: string;
  title: string;
  category: 'SAFETY' | 'COMPLIANCE' | 'SKILLS' | 'CERTIFICATION' | 'REFRESHER';
  duration: number; // minutes
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  required: boolean;
  description: string;
  prerequisites?: string[];
  certification?: string;
  expirationMonths?: number;
}

interface DriverTrainingRecord {
  id: string;
  driverId: string;
  driverName: string;
  email: string;
  hireDate: Date;
  overallProgress: number;
  completedModules: CompletedModule[];
  upcomingDeadlines: TrainingDeadline[];
  certifications: DriverCertification[];
  skillRatings: SkillRating[];
  trainingScore: number;
  lastActivity: Date;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
}

interface CompletedModule {
  moduleId: string;
  completedDate: Date;
  score: number;
  timeSpent: number;
  attempts: number;
  certified: boolean;
  expirationDate?: Date;
}

interface TrainingDeadline {
  moduleId: string;
  moduleTitle: string;
  dueDate: Date;
  urgency: 'OVERDUE' | 'DUE_SOON' | 'UPCOMING';
  required: boolean;
}

interface DriverCertification {
  id: string;
  name: string;
  issueDate: Date;
  expirationDate: Date;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  authority: string;
  certificateNumber: string;
}

interface SkillRating {
  skill: string;
  rating: number; // 1-5
  lastAssessed: Date;
  improvement: number; // percentage change
}

const mockTrainingModules: TrainingModule[] = [
  {
    id: 'mod1',
    title: 'Defensive Driving Techniques',
    category: 'SAFETY',
    duration: 45,
    difficulty: 'BEGINNER',
    required: true,
    description: 'Essential defensive driving strategies for commercial vehicles',
    certification: 'Defensive Driving Certificate',
    expirationMonths: 12
  },
  {
    id: 'mod2',
    title: 'HOS Regulations & ELD Usage',
    category: 'COMPLIANCE',
    duration: 60,
    difficulty: 'INTERMEDIATE',
    required: true,
    description: 'Hours of Service regulations and Electronic Logging Device compliance',
    certification: 'HOS Compliance Certificate',
    expirationMonths: 24
  },
  {
    id: 'mod3',
    title: 'Vehicle Inspection Procedures',
    category: 'SKILLS',
    duration: 30,
    difficulty: 'BEGINNER',
    required: true,
    description: 'Daily Vehicle Inspection Report (DVIR) procedures and safety checks'
  },
  {
    id: 'mod4',
    title: 'Hazmat Transportation',
    category: 'CERTIFICATION',
    duration: 120,
    difficulty: 'ADVANCED',
    required: false,
    description: 'Hazardous materials handling and transportation regulations',
    prerequisites: ['mod1', 'mod2'],
    certification: 'Hazmat Endorsement',
    expirationMonths: 60
  }
];

const mockDriverRecords: DriverTrainingRecord[] = [
  {
    id: 'dr1',
    driverId: 'd1',
    driverName: 'John Smith',
    email: 'john.smith@waygo.com',
    hireDate: new Date('2023-01-15'),
    overallProgress: 85,
    completedModules: [
      {
        moduleId: 'mod1',
        completedDate: new Date('2024-01-10'),
        score: 92,
        timeSpent: 45,
        attempts: 1,
        certified: true,
        expirationDate: new Date('2025-01-10')
      },
      {
        moduleId: 'mod2',
        completedDate: new Date('2024-02-15'),
        score: 88,
        timeSpent: 65,
        attempts: 1,
        certified: true,
        expirationDate: new Date('2026-02-15')
      }
    ],
    upcomingDeadlines: [
      {
        moduleId: 'mod3',
        moduleTitle: 'Vehicle Inspection Procedures',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        urgency: 'DUE_SOON',
        required: true
      }
    ],
    certifications: [
      {
        id: 'cert1',
        name: 'CDL Class A',
        issueDate: new Date('2023-01-01'),
        expirationDate: new Date('2027-01-01'),
        status: 'VALID',
        authority: 'State DMV',
        certificateNumber: 'CDL123456'
      }
    ],
    skillRatings: [
      {
        skill: 'Safety Awareness',
        rating: 4.5,
        lastAssessed: new Date('2024-03-01'),
        improvement: 8.2
      },
      {
        skill: 'Fuel Efficiency',
        rating: 4.2,
        lastAssessed: new Date('2024-03-01'),
        improvement: 12.5
      },
      {
        skill: 'Customer Service',
        rating: 4.8,
        lastAssessed: new Date('2024-03-01'),
        improvement: 5.1
      }
    ],
    trainingScore: 92,
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'COMPLIANT'
  },
  {
    id: 'dr2',
    driverId: 'd2',
    driverName: 'Sarah Johnson',
    email: 'sarah.johnson@waygo.com',
    hireDate: new Date('2023-06-01'),
    overallProgress: 60,
    completedModules: [
      {
        moduleId: 'mod1',
        completedDate: new Date('2023-12-15'),
        score: 76,
        timeSpent: 52,
        attempts: 2,
        certified: true,
        expirationDate: new Date('2024-12-15')
      }
    ],
    upcomingDeadlines: [
      {
        moduleId: 'mod2',
        moduleTitle: 'HOS Regulations & ELD Usage',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        urgency: 'OVERDUE',
        required: true
      }
    ],
    certifications: [
      {
        id: 'cert2',
        name: 'CDL Class A',
        issueDate: new Date('2023-05-15'),
        expirationDate: new Date('2025-05-15'),
        status: 'EXPIRING_SOON',
        authority: 'State DMV',
        certificateNumber: 'CDL789012'
      }
    ],
    skillRatings: [
      {
        skill: 'Safety Awareness',
        rating: 3.8,
        lastAssessed: new Date('2024-02-15'),
        improvement: -2.5
      },
      {
        skill: 'Fuel Efficiency',
        rating: 3.5,
        lastAssessed: new Date('2024-02-15'),
        improvement: 1.2
      }
    ],
    trainingScore: 76,
    lastActivity: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'NON_COMPLIANT'
  }
];

export default function DriverTrainingScreen() {
  const theme = useTheme();
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>(mockTrainingModules);
  const [driverRecords, setDriverRecords] = useState<DriverTrainingRecord[]>(mockDriverRecords);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'drivers' | 'modules'>('drivers');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return '#4CAF50';
      case 'WARNING': return '#FF9800';
      case 'NON_COMPLIANT': return '#F44336';
      case 'VALID': return '#4CAF50';
      case 'EXPIRING_SOON': return '#FF9800';
      case 'EXPIRED': return '#F44336';
      default: return theme.colors.outline;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'OVERDUE': return '#F44336';
      case 'DUE_SOON': return '#FF9800';
      case 'UPCOMING': return '#2196F3';
      default: return theme.colors.outline;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SAFETY': return '#F44336';
      case 'COMPLIANCE': return '#2196F3';
      case 'SKILLS': return '#4CAF50';
      case 'CERTIFICATION': return '#9C27B0';
      case 'REFRESHER': return '#FF9800';
      default: return theme.colors.outline;
    }
  };

  const viewDriverDetails = (driver: DriverTrainingRecord) => {
    const overdue = driver.upcomingDeadlines.filter(d => d.urgency === 'OVERDUE').length;
    const avgSkillRating = driver.skillRatings.reduce((sum, s) => sum + s.rating, 0) / driver.skillRatings.length;
    
    Alert.alert(
      `Training Profile - ${driver.driverName}`,
      `Email: ${driver.email}
Hire Date: ${driver.hireDate.toLocaleDateString()}
Training Status: ${driver.status}

Progress Overview:
• Overall Progress: ${driver.overallProgress}%
• Training Score: ${driver.trainingScore}/100
• Completed Modules: ${driver.completedModules.length}
• Overdue Items: ${overdue}

Skill Ratings:
• Average Rating: ${avgSkillRating.toFixed(1)}/5.0
${driver.skillRatings.map(s => `• ${s.skill}: ${s.rating}/5.0`).join('\n')}

Certifications:
${driver.certifications.map(c => `• ${c.name}: ${c.status}`).join('\n')}

Last Activity: ${driver.lastActivity.toLocaleDateString()}`,
      [
        { text: 'OK' },
        { text: 'Assign Training', onPress: () => Alert.alert('Training Assigned', 'New training module assigned to driver.') },
        { text: 'Send Reminder', onPress: () => Alert.alert('Reminder Sent', 'Training reminder sent to driver.') }
      ]
    );
  };

  const viewModuleDetails = (module: TrainingModule) => {
    const completions = driverRecords.reduce((sum, d) => 
      sum + (d.completedModules.some(cm => cm.moduleId === module.id) ? 1 : 0), 0
    );
    const avgScore = driverRecords
      .flatMap(d => d.completedModules)
      .filter(cm => cm.moduleId === module.id)
      .reduce((sum, cm, _, arr) => sum + cm.score / arr.length, 0) || 0;

    Alert.alert(
      `Training Module - ${module.title}`,
      `Category: ${module.category}
Duration: ${module.duration} minutes
Difficulty: ${module.difficulty}
Required: ${module.required ? 'Yes' : 'No'}

Description:
${module.description}

Statistics:
• Completions: ${completions}/${driverRecords.length} drivers
• Average Score: ${avgScore.toFixed(1)}%
• Completion Rate: ${((completions / driverRecords.length) * 100).toFixed(1)}%

${module.certification ? `Certification: ${module.certification}` : ''}
${module.expirationMonths ? `Valid for: ${module.expirationMonths} months` : ''}
${module.prerequisites ? `Prerequisites: ${module.prerequisites.join(', ')}` : ''}`,
      [
        { text: 'OK' },
        { text: 'Edit Module', onPress: () => Alert.alert('Edit', 'Module editor will open in a future update.') },
        { text: 'Assign to Driver', onPress: () => Alert.alert('Assign', 'Driver assignment dialog will open.') }
      ]
    );
  };

  const assignTraining = (driverId: string) => {
    Alert.alert(
      'Assign Training',
      'Select training modules to assign to this driver.',
      [
        { text: 'Cancel' },
        { text: 'Assign Required', onPress: () => Alert.alert('Assigned', 'Required training modules assigned.') },
        { text: 'Custom Assignment', onPress: () => Alert.alert('Custom', 'Custom training assignment dialog will open.') }
      ]
    );
  };

  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Training statistics
  const trainingStats = {
    totalDrivers: driverRecords.length,
    compliantDrivers: driverRecords.filter(d => d.status === 'COMPLIANT').length,
    nonCompliantDrivers: driverRecords.filter(d => d.status === 'NON_COMPLIANT').length,
    overdueItems: driverRecords.reduce((sum, d) => sum + d.upcomingDeadlines.filter(dl => dl.urgency === 'OVERDUE').length, 0),
    avgProgress: driverRecords.reduce((sum, d) => sum + d.overallProgress, 0) / driverRecords.length,
    avgTrainingScore: driverRecords.reduce((sum, d) => sum + d.trainingScore, 0) / driverRecords.length
  };

  const filteredDrivers = driverRecords.filter(driver => {
    const matchesSearch = !searchQuery || 
      driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'compliant' && driver.status === 'COMPLIANT') ||
      (selectedFilter === 'non-compliant' && driver.status === 'NON_COMPLIANT') ||
      (selectedFilter === 'overdue' && driver.upcomingDeadlines.some(d => d.urgency === 'OVERDUE'));

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Driver Training Portal</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={refreshData}
              loading={refreshing}
              icon="refresh"
              compact
            >
              Refresh
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => Alert.alert('Export', 'Training reports exported!')}
              icon="download"
              compact
            >
              Export
            </Button>
          </View>
        </View>

        {/* Training Statistics */}
        <Card style={{ marginBottom: 16, padding: 12 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>Training Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <View style={{ alignItems: 'center', width: '30%' }}>
              <Text variant="headlineSmall">{trainingStats.totalDrivers}</Text>
              <Text variant="bodySmall">Total Drivers</Text>
            </View>
            <View style={{ alignItems: 'center', width: '30%' }}>
              <Text variant="headlineSmall" style={{ color: '#4CAF50' }}>{trainingStats.compliantDrivers}</Text>
              <Text variant="bodySmall">Compliant</Text>
            </View>
            <View style={{ alignItems: 'center', width: '30%' }}>
              <Text variant="headlineSmall" style={{ color: trainingStats.nonCompliantDrivers > 0 ? '#F44336' : '#4CAF50' }}>
                {trainingStats.nonCompliantDrivers}
              </Text>
              <Text variant="bodySmall">Non-Compliant</Text>
            </View>
            <View style={{ alignItems: 'center', width: '30%', marginTop: 12 }}>
              <Text variant="headlineSmall">{trainingStats.avgProgress.toFixed(0)}%</Text>
              <Text variant="bodySmall">Avg Progress</Text>
            </View>
            <View style={{ alignItems: 'center', width: '30%', marginTop: 12 }}>
              <Text variant="headlineSmall">{trainingStats.avgTrainingScore.toFixed(0)}</Text>
              <Text variant="bodySmall">Avg Score</Text>
            </View>
            <View style={{ alignItems: 'center', width: '30%', marginTop: 12 }}>
              <Text variant="headlineSmall" style={{ color: trainingStats.overdueItems > 0 ? '#F44336' : '#4CAF50' }}>
                {trainingStats.overdueItems}
              </Text>
              <Text variant="bodySmall">Overdue</Text>
            </View>
          </View>
        </Card>

        {/* View Toggle */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Button
            mode={selectedView === 'drivers' ? 'contained' : 'outlined'}
            onPress={() => setSelectedView('drivers')}
            style={{ flex: 1, marginRight: 8 }}
            icon="account-group"
          >
            Drivers
          </Button>
          <Button
            mode={selectedView === 'modules' ? 'contained' : 'outlined'}
            onPress={() => setSelectedView('modules')}
            style={{ flex: 1 }}
            icon="book-open"
          >
            Modules
          </Button>
        </View>

        {selectedView === 'drivers' && (
          <>
            {/* Search */}
            <Searchbar
              placeholder="Search drivers..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ marginBottom: 16 }}
            />

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { key: 'all', label: 'All Drivers' },
                  { key: 'compliant', label: 'Compliant' },
                  { key: 'non-compliant', label: 'Non-Compliant' },
                  { key: 'overdue', label: 'Overdue Items' }
                ].map(filter => (
                  <Chip
                    key={filter.key}
                    selected={selectedFilter === filter.key}
                    onPress={() => setSelectedFilter(filter.key)}
                    style={{ marginRight: 8 }}
                  >
                    {filter.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {selectedView === 'drivers' ? (
          /* Driver Training Records */
          filteredDrivers.map(driver => {
            const overdueCount = driver.upcomingDeadlines.filter(d => d.urgency === 'OVERDUE').length;
            const expiringCerts = driver.certifications.filter(c => c.status === 'EXPIRING_SOON').length;
            
            return (
              <Card key={driver.id} style={{ marginBottom: 12 }}>
                <List.Item
                  title={driver.driverName}
                  description={`${driver.email} • Hired: ${driver.hireDate.toLocaleDateString()}`}
                  left={(props) => (
                    <Avatar.Icon 
                      {...props} 
                      icon="account"
                      style={{ backgroundColor: getStatusColor(driver.status) }}
                    />
                  )}
                  right={(props) => (
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                      <Badge style={{ backgroundColor: getStatusColor(driver.status) }}>
                        {driver.status}
                      </Badge>
                      {overdueCount > 0 && (
                        <Badge style={{ backgroundColor: '#F44336' }}>
                          {`${overdueCount} overdue`}
                        </Badge>
                      )}
                    </View>
                  )}
                  onPress={() => viewDriverDetails(driver)}
                />

                {/* Progress Bar */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Training Progress</Text>
                    <Text variant="bodySmall">{driver.overallProgress}%</Text>
                  </View>
                  <ProgressBar progress={driver.overallProgress / 100} style={{ height: 6 }} />
                </View>

                {/* Skill Ratings */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <Text variant="bodySmall" style={{ marginBottom: 4 }}>Skill Ratings</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {driver.skillRatings.slice(0, 3).map(skill => (
                      <View key={skill.skill} style={{ alignItems: 'center' }}>
                        <Text variant="bodySmall">{skill.skill}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Star size={12} color="#FFD700" />
                          <Text variant="bodySmall">{skill.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8 }}>
                  <Button
                    mode="outlined"
                    onPress={() => viewDriverDetails(driver)}
                    style={{ flex: 1 }}
                    icon="eye"
                    compact
                  >
                    Details
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => assignTraining(driver.id)}
                    icon="plus"
                    compact
                  >
                    Assign
                  </Button>
                </View>
              </Card>
            );
          })
        ) : (
          /* Training Modules */
          trainingModules.map(module => {
            const completions = driverRecords.filter(d => 
              d.completedModules.some(cm => cm.moduleId === module.id)
            ).length;
            const completionRate = (completions / driverRecords.length) * 100;
            
            return (
              <Card key={module.id} style={{ marginBottom: 12 }}>
                <List.Item
                  title={module.title}
                  description={`${module.category} • ${module.duration} min • ${module.difficulty}`}
                  left={(props) => (
                    <Avatar.Icon 
                      {...props} 
                      icon="book-open"
                      style={{ backgroundColor: getCategoryColor(module.category) }}
                    />
                  )}
                  right={(props) => (
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                      {module.required && (
                        <Badge style={{ backgroundColor: '#F44336' }}>
                          REQUIRED
                        </Badge>
                      )}
                      <Text variant="bodySmall">{completionRate.toFixed(0)}% complete</Text>
                    </View>
                  )}
                  onPress={() => viewModuleDetails(module)}
                />

                {/* Module Info */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <Text variant="bodyMedium" style={{ marginBottom: 8 }}>{module.description}</Text>
                  
                  {/* Completion Progress */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodySmall">Completion Rate</Text>
                    <Text variant="bodySmall">{completions}/{driverRecords.length} drivers</Text>
                  </View>
                  <ProgressBar progress={completionRate / 100} style={{ height: 6, marginBottom: 8 }} />

                  {/* Module Details */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Clock size={16} color={theme.colors.outline} />
                      <Text variant="bodySmall">{module.duration}m</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <GraduationCap size={16} color={theme.colors.outline} />
                      <Text variant="bodySmall">{module.difficulty}</Text>
                    </View>
                    {module.certification && (
                      <View style={{ alignItems: 'center' }}>
                        <Award size={16} color={theme.colors.outline} />
                        <Text variant="bodySmall">Cert</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8 }}>
                  <Button
                    mode="outlined"
                    onPress={() => viewModuleDetails(module)}
                    style={{ flex: 1 }}
                    icon="eye"
                    compact
                  >
                    Details
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => Alert.alert('Edit', 'Module editor will open in a future update.')}
                    icon="pencil"
                    compact
                  >
                    Edit
                  </Button>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <IconButton
          icon="plus"
          mode="contained"
          size={24}
          onPress={() => Alert.alert(
            'Add New',
            selectedView === 'drivers' ? 'Add new driver training record' : 'Create new training module',
            [
              { text: 'Cancel' },
              { text: 'Add', onPress: () => Alert.alert('Added', `New ${selectedView === 'drivers' ? 'driver record' : 'training module'} will be created.`) }
            ]
          )}
          style={{ backgroundColor: theme.colors.primary }}
        />
      </View>
    </View>
  );
}
