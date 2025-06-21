import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { 
  Text, 
  useTheme, 
  Card, 
  List, 
  Button, 
  Searchbar,
  Chip,
  Portal,
  Modal,
  Divider
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Video, 
  Phone, 
  Mail,
  ChevronRight,
  Search
} from '../../../utils/icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpCenterScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'loads', label: 'Load Management' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'billing', label: 'Billing' },
    { id: 'account', label: 'Account' },
    { id: 'technical', label: 'Technical' }
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a new load?',
      answer: 'To create a new load, go to the Loads tab and tap the "+" button. Fill in the pickup and delivery information, select a driver, and save.',
      category: 'loads'
    },
    {
      id: '2',
      question: 'How do I track my shipments?',
      answer: 'You can track shipments in real-time using the Map tab. Click on any truck icon to see the driver\'s route and current location.',
      category: 'tracking'
    },
    {
      id: '3',
      question: 'How do I invite drivers to the platform?',
      answer: 'Go to Fleet Management > Drivers, then tap "Add Driver". Enter their information and they\'ll receive an invitation email.',
      category: 'getting-started'
    },
    {
      id: '4',
      question: 'How does billing work?',
      answer: 'Billing is handled monthly based on your subscription plan. You can view invoices and update payment methods in the Billing section.',
      category: 'billing'
    },
    {
      id: '5',
      question: 'Can I change my subscription plan?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time in Account > Billing. Changes take effect at the next billing cycle.',
      category: 'billing'
    },
    {
      id: '6',
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password" and enter your email. You\'ll receive a reset link within a few minutes.',
      category: 'account'
    },
    {
      id: '7',
      question: 'What if the app crashes or has issues?',
      answer: 'Try restarting the app first. If issues persist, contact support at ec.industries.usa.l.l.c@gmail.com with details about the problem.',
      category: 'technical'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSupport = () => {
    Linking.openURL('mailto:ec.industries.usa.l.l.c@gmail.com?subject=WayGo Freight Support Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1-800-WAYGO-01');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{
          title: 'Help Center',
          headerStyle: { backgroundColor: theme.colors.surface },
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              How can we help you?
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Find answers to common questions or contact our support team
            </Text>
          </Card.Content>
        </Card>

        {/* Search */}
        <Searchbar
          placeholder="Search help articles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon={() => <Search size={20} color={theme.colors.onSurfaceVariant} />}
        />

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map(category => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.categoryChip}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                icon={() => <Mail size={20} color={theme.colors.primary} />}
                onPress={handleContactSupport}
                style={styles.actionButton}
              >
                Email Support
              </Button>
              <Button
                mode="outlined"
                icon={() => <Phone size={20} color={theme.colors.primary} />}
                onPress={handleCallSupport}
                style={styles.actionButton}
              >
                Call Support
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* FAQ Section */}
        <Card style={styles.faqCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Frequently Asked Questions
            </Text>
            
            {filteredFAQs.length === 0 ? (
              <View style={styles.emptyState}>
                <HelpCircle size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No articles found
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Try adjusting your search or contact support
                </Text>
              </View>
            ) : (
              filteredFAQs.map(faq => (
                <List.Item
                  key={faq.id}
                  title={faq.question}
                  left={() => <List.Icon icon="help-circle" />}
                  right={() => <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />}
                  onPress={() => setSelectedFAQ(faq)}
                  style={styles.faqItem}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Contact Info */}
        <Card style={styles.contactCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Still Need Help?
            </Text>
            <Text variant="bodyMedium" style={styles.contactText}>
              Our support team is here to help you succeed.
            </Text>
            <View style={styles.contactInfo}>
              <Text variant="bodyMedium">📧 ec.industries.usa.l.l.c@gmail.com</Text>
              <Text variant="bodyMedium">📞 1-800-WAYGO-01</Text>
              <Text variant="bodyMedium">🏢 E&C Industries L.L.C.</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAQ Detail Modal */}
      <Portal>
        <Modal
          visible={!!selectedFAQ}
          onDismiss={() => setSelectedFAQ(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {selectedFAQ && (
            <>
              <Text variant="titleLarge" style={styles.modalTitle}>
                {selectedFAQ.question}
              </Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.modalAnswer}>
                {selectedFAQ.answer}
              </Text>
              <Button
                mode="contained"
                onPress={() => setSelectedFAQ(null)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </>
          )}
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
    marginBottom: 8,
  },
  headerTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  searchBar: {
    margin: 16,
    marginTop: 8,
  },
  categoryContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  categoryContent: {
    paddingRight: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  quickActionsCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  faqCard: {
    margin: 16,
    marginTop: 0,
  },
  faqItem: {
    paddingVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.7,
  },
  contactCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
  },
  contactText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  contactInfo: {
    gap: 8,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  modalAnswer: {
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    alignSelf: 'center',
  },
});

export default HelpCenterScreen;
