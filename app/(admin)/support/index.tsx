import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { 
  Text, 
  useTheme, 
  Card, 
  Button, 
  TextInput,
  RadioButton,
  Chip,
  Portal,
  Modal,
  List,
  Divider
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Info,
  Bug,
  HelpCircle
} from '../../../utils/icons';

interface SupportTicket {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  contactMethod: 'email' | 'phone';
}

const ContactSupportScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general',
    contactMethod: 'email'
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const categories = [
    { id: 'general', label: 'General Question', icon: 'help-circle' },
    { id: 'technical', label: 'Technical Issue', icon: 'bug' },
    { id: 'billing', label: 'Billing Support', icon: 'credit-card' },
    { id: 'account', label: 'Account Issue', icon: 'account' },
    { id: 'feature', label: 'Feature Request', icon: 'lightbulb' },
    { id: 'emergency', label: 'Emergency Support', icon: 'alert-circle' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4CAF50', description: 'General questions, not urgent' },
    { value: 'medium', label: 'Medium', color: '#FF9800', description: 'Normal business impact' },
    { value: 'high', label: 'High', color: '#F44336', description: 'Significant business impact' },
    { value: 'urgent', label: 'Urgent', color: '#9C27B0', description: 'Critical system down' }
  ];

  const handleQuickContact = (method: 'email' | 'phone') => {
    if (method === 'email') {
      Linking.openURL('mailto:ec.industries.usa.l.l.c@gmail.com?subject=WayGo Freight Support Request');
    } else {
      Linking.openURL('tel:+1-800-WAYGO-01');
    }
  };

  const handleSubmitTicket = () => {
    if (!ticket.subject.trim() || !ticket.message.trim()) {
      Alert.alert('Required Fields', 'Please fill in both subject and message.');
      return;
    }

    // Create email with ticket details
    const emailBody = `
Category: ${categories.find(c => c.id === ticket.category)?.label}
Priority: ${priorities.find(p => p.value === ticket.priority)?.label}
Preferred Contact: ${ticket.contactMethod === 'email' ? 'Email' : 'Phone'}

Message:
${ticket.message}

---
Sent from WayGo Freight Mobile App
E&C Industries L.L.C.
    `.trim();

    const emailURL = `mailto:ec.industries.usa.l.l.c@gmail.com?subject=${encodeURIComponent(ticket.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    Linking.openURL(emailURL).then(() => {
      setShowConfirmation(true);
      // Reset form
      setTicket({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general',
        contactMethod: 'email'
      });
    }).catch(() => {
      Alert.alert('Error', 'Could not open email client. Please contact us directly at ec.industries.usa.l.l.c@gmail.com');
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{
          title: 'Contact Support',
          headerStyle: { backgroundColor: theme.colors.surface },
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Get Help & Support
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Our team is here to help you succeed with WayGo Freight
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Contact */}
        <Card style={styles.quickContactCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Contact
            </Text>
            <View style={styles.quickContactButtons}>
              <Button
                mode="contained"
                icon={() => <Mail size={20} color="white" />}
                onPress={() => handleQuickContact('email')}
                style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
              >
                Email Us
              </Button>
              <Button
                mode="outlined"
                icon={() => <Phone size={20} color={theme.colors.primary} />}
                onPress={() => handleQuickContact('phone')}
                style={styles.contactButton}
              >
                Call Us
              </Button>
            </View>
            
            <View style={styles.contactInfo}>
              <Text variant="bodySmall" style={styles.contactDetail}>
                📧 ec.industries.usa.l.l.c@gmail.com
              </Text>
              <Text variant="bodySmall" style={styles.contactDetail}>
                📞 1-800-WAYGO-01
              </Text>
              <Text variant="bodySmall" style={styles.contactDetail}>
                🕒 Business Hours: Monday-Friday, 8 AM - 6 PM EST
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Support Form */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Submit Support Request
            </Text>

            {/* Category Selection */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              Category
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {categories.map(category => (
                <Chip
                  key={category.id}
                  selected={ticket.category === category.id}
                  onPress={() => setTicket(prev => ({ ...prev, category: category.id }))}
                  style={styles.categoryChip}
                  icon={category.icon}
                >
                  {category.label}
                </Chip>
              ))}
            </ScrollView>

            {/* Priority Selection */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              Priority Level
            </Text>
            <View style={styles.priorityContainer}>
              {priorities.map(priority => (
                <List.Item
                  key={priority.value}
                  title={priority.label}
                  description={priority.description}
                  left={() => (
                    <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                  )}
                  right={() => (
                    <RadioButton
                      value={priority.value}
                      status={ticket.priority === priority.value ? 'checked' : 'unchecked'}
                      onPress={() => setTicket(prev => ({ ...prev, priority: priority.value as any }))}
                    />
                  )}
                  onPress={() => setTicket(prev => ({ ...prev, priority: priority.value as any }))}
                  style={styles.priorityItem}
                />
              ))}
            </View>

            {/* Contact Method */}
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              Preferred Contact Method
            </Text>
            <View style={styles.contactMethodContainer}>
              <List.Item
                title="Email"
                description="We'll respond via email"
                left={() => <Mail size={24} color={theme.colors.primary} />}
                right={() => (
                  <RadioButton
                    value="email"
                    status={ticket.contactMethod === 'email' ? 'checked' : 'unchecked'}
                    onPress={() => setTicket(prev => ({ ...prev, contactMethod: 'email' }))}
                  />
                )}
                onPress={() => setTicket(prev => ({ ...prev, contactMethod: 'email' }))}
              />
              <List.Item
                title="Phone"
                description="We'll call you back"
                left={() => <Phone size={24} color={theme.colors.primary} />}
                right={() => (
                  <RadioButton
                    value="phone"
                    status={ticket.contactMethod === 'phone' ? 'checked' : 'unchecked'}
                    onPress={() => setTicket(prev => ({ ...prev, contactMethod: 'phone' }))}
                  />
                )}
                onPress={() => setTicket(prev => ({ ...prev, contactMethod: 'phone' }))}
              />
            </View>

            {/* Subject */}
            <TextInput
              label="Subject"
              value={ticket.subject}
              onChangeText={(text) => setTicket(prev => ({ ...prev, subject: text }))}
              style={styles.textInput}
              mode="outlined"
            />

            {/* Message */}
            <TextInput
              label="Describe your issue or question"
              value={ticket.message}
              onChangeText={(text) => setTicket(prev => ({ ...prev, message: text }))}
              multiline
              numberOfLines={6}
              style={styles.textInput}
              mode="outlined"
            />

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmitTicket}
              style={styles.submitButton}
              icon={() => <MessageCircle size={20} color="white" />}
            >
              Send Support Request
            </Button>
          </Card.Content>
        </Card>

        {/* Company Info */}
        <Card style={styles.companyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              About E&C Industries L.L.C.
            </Text>
            <Text variant="bodyMedium" style={styles.companyText}>
              WayGo Freight is proudly developed and supported by E&C Industries L.L.C., 
              committed to revolutionizing freight management through innovative technology 
              and exceptional customer service.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Confirmation Modal */}
      <Portal>
        <Modal
          visible={showConfirmation}
          onDismiss={() => setShowConfirmation(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.confirmationContent}>
            <CheckCircle size={48} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.confirmationTitle}>
              Request Sent!
            </Text>
            <Text variant="bodyMedium" style={styles.confirmationText}>
              Your support request has been sent to our team. We'll get back to you within 
              24 hours (or sooner for urgent issues).
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowConfirmation(false)}
              style={styles.confirmationButton}
            >
              Got it
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
  },
  headerTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  quickContactCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  quickContactButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  contactButton: {
    flex: 1,
  },
  contactInfo: {
    gap: 4,
  },
  contactDetail: {
    opacity: 0.7,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityItem: {
    paddingVertical: 4,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 14,
    marginLeft: 6,
  },
  contactMethodContainer: {
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  companyCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
  },
  companyText: {
    lineHeight: 20,
    opacity: 0.8,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  confirmationContent: {
    alignItems: 'center',
  },
  confirmationTitle: {
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationText: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmationButton: {
    paddingHorizontal: 24,
  },
});

export default ContactSupportScreen;
