import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  useTheme, 
  Card, 
  SegmentedButtons,
  Divider,
  List,
  Button
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  FileText, 
  Shield, 
  Eye, 
  Lock,
  Calendar,
  Mail
} from '../../../utils/icons';

const LegalScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState('terms');

  const handleContactLegal = () => {
    // Open email to legal contact
    const emailURL = 'mailto:ec.industries.usa.l.l.c@gmail.com?subject=Legal Inquiry - WayGo Freight';
    
    try {
      import('expo-linking').then(({ default: Linking }) => {
        Linking.openURL(emailURL);
      });
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const TermsContent = () => (
    <ScrollView style={styles.contentScroll}>
      <Card style={styles.contentCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Terms of Service
          </Text>
          <Text variant="bodySmall" style={styles.lastUpdated}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
          
          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            1. Acceptance of Terms
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            By accessing and using WayGo Freight (the "Service"), you accept and agree to be bound by 
            the terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            2. Description of Service
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            WayGo Freight is a freight management platform provided by E&C Industries L.L.C. that 
            enables users to manage shipments, track deliveries, communicate with drivers, and 
            handle freight operations efficiently.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            3. User Accounts and Responsibilities
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Users are responsible for maintaining the confidentiality of their account information 
            and for all activities that occur under their account. You agree to immediately notify 
            E&C Industries L.L.C. of any unauthorized use of your account.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            4. Acceptable Use Policy
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            You agree not to use the Service for any unlawful purpose or in any way that could 
            damage, disable, overburden, or impair the Service. You will not attempt to gain 
            unauthorized access to any part of the Service.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            5. Data and Privacy
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Your privacy is important to us. Please refer to our Privacy Policy for information 
            about how we collect, use, and protect your data when using our Service.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            6. Payment Terms
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Subscription fees are billed in advance on a monthly basis. All fees are non-refundable 
            except as required by law. We reserve the right to change our pricing with 30 days notice.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            7. Limitation of Liability
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            E&C Industries L.L.C. shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages resulting from your use of the Service.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            8. Termination
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Either party may terminate this agreement at any time. Upon termination, your access 
            to the Service will be discontinued, and any data may be deleted.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            9. Governing Law
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            This agreement shall be governed by and construed in accordance with the laws of the 
            United States and the jurisdiction where E&C Industries L.L.C. operates.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            10. Contact Information
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            For questions about these Terms of Service, please contact us at:
          </Text>
          <Text variant="bodyMedium" style={styles.contactInfo}>
            E&C Industries L.L.C.{'\n'}
            Email: ec.industries.usa.l.l.c@gmail.com
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const PrivacyContent = () => (
    <ScrollView style={styles.contentScroll}>
      <Card style={styles.contentCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Privacy Policy
          </Text>
          <Text variant="bodySmall" style={styles.lastUpdated}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
          
          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            1. Information We Collect
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account, 
            update your profile, or contact us for support. This includes your name, email address, 
            phone number, and company information.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            2. How We Use Your Information
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We use the information we collect to provide, maintain, and improve our services, 
            process transactions, send communications, and protect the security of our platform.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            3. Location Data
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            With your permission, we collect location data to provide real-time tracking and 
            route optimization features. You can disable location services at any time through 
            your device settings.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            4. Data Sharing and Disclosure
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy or as required by law.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            5. Data Security
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
            secure servers, and regular security audits.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            6. Data Retention
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We retain your information for as long as your account is active or as needed to 
            provide services. We may retain certain information for legitimate business purposes 
            or as required by law.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            7. Your Rights and Choices
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            You have the right to access, update, or delete your personal information. You can 
            also opt out of certain communications and control your privacy settings within the app.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            8. Cookies and Tracking
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and improve our services. You can control cookie preferences through your browser settings.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            9. Children's Privacy
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Our services are not intended for children under 13. We do not knowingly collect 
            personal information from children under 13. If we become aware of such collection, 
            we will delete the information immediately.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            10. Changes to This Policy
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any 
            significant changes by posting the new policy on this page and updating the 
            "last updated" date.
          </Text>

          <Text variant="titleMedium" style={styles.subsectionTitle}>
            11. Contact Us
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:
          </Text>
          <Text variant="bodyMedium" style={styles.contactInfo}>
            E&C Industries L.L.C.{'\n'}
            Email: ec.industries.usa.l.l.c@gmail.com
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{
          title: 'Terms & Privacy',
          headerStyle: { backgroundColor: theme.colors.surface },
        }} 
      />
      
      {/* Tab Selector */}
      <Card style={styles.tabCard}>
        <Card.Content>
          <SegmentedButtons
            value={selectedTab}
            onValueChange={setSelectedTab}
            buttons={[
              {
                value: 'terms',
                label: 'Terms of Service',
                icon: () => <FileText size={16} color={theme.colors.primary} />,
              },
              {
                value: 'privacy',
                label: 'Privacy Policy',
                icon: () => <Shield size={16} color={theme.colors.primary} />,
              },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
      </View>

      {/* Contact Legal */}
      <Card style={styles.contactCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.contactTitle}>
            Questions about our legal documents?
          </Text>
          <Button
            mode="outlined"
            icon={() => <Mail size={20} color={theme.colors.primary} />}
            onPress={handleContactLegal}
            style={styles.contactButton}
          >
            Contact Legal Team
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabCard: {
    margin: 16,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify',
  },
  contactInfo: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  contactCard: {
    margin: 16,
    marginBottom: 32,
  },
  contactTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  contactButton: {
    alignSelf: 'center',
  },
});

export default LegalScreen;
