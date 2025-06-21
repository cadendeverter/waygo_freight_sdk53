// waygo-freight/app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text, Card, Button, TextInput, useTheme, Divider, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft, CheckCircle, Send } from '../../utils/icons';
import { useAuth } from '../../state/authContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import Heading from '../../components/typography/Heading';

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert(
        'Reset Failed',
        error.message || 'An error occurred while sending the reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text.toLowerCase());
    if (emailError) {
      setEmailError('');
    }
  };

  if (emailSent) {
    return (
      <ScreenWrapper>
        <Stack.Screen 
          options={{ 
            title: 'Check Your Email',
            headerShown: true,
            headerTitleAlign: 'center'
          }} 
        />
        
        <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
          <View style={{ maxWidth: 400, alignSelf: 'center', width: '100%' }}>
            <Card style={{ padding: 32 }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <CheckCircle size={64} color={theme.colors.primary} />
                <Heading level={2} style={{ marginTop: 16, textAlign: 'center' }}>
                  Email Sent!
                </Heading>
                <Text style={{ 
                  textAlign: 'center', 
                  marginTop: 8, 
                  color: theme.colors.onSurfaceVariant,
                  lineHeight: 20
                }}>
                  We've sent a password reset link to:
                </Text>
                <Text style={{ 
                  fontWeight: '600', 
                  marginTop: 4,
                  color: theme.colors.primary 
                }}>
                  {email}
                </Text>
              </View>

              <View style={{ gap: 16 }}>
                <Text style={{ 
                  textAlign: 'center', 
                  color: theme.colors.onSurfaceVariant,
                  lineHeight: 20
                }}>
                  Please check your email and click the reset link to create a new password. 
                  The link will expire in 24 hours.
                </Text>

                <Text style={{ 
                  textAlign: 'center', 
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 12,
                  fontStyle: 'italic'
                }}>
                  Don't see the email? Check your spam folder or try again.
                </Text>

                <Button
                  mode="contained"
                  onPress={() => setEmailSent(false)}
                  style={{ marginTop: 8 }}
                  contentStyle={{ paddingVertical: 8 }}
                  icon={() => <Send size={20} color={theme.colors.onPrimary} />}
                >
                  Send Another Email
                </Button>

                <Divider style={{ marginVertical: 8 }} />

                <Button
                  mode="outlined"
                  onPress={() => router.replace('/(auth)/login')}
                  contentStyle={{ paddingVertical: 8 }}
                  icon={() => <ArrowLeft size={20} color={theme.colors.primary} />}
                >
                  Back to Sign In
                </Button>
              </View>
            </Card>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{ 
          title: 'Reset Password',
          headerShown: true,
          headerTitleAlign: 'center'
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center', maxWidth: 400, alignSelf: 'center', width: '100%' }}>
            
            <Card style={{ padding: 24 }}>
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Mail size={48} color={theme.colors.primary} />
                <Heading level={2} style={{ marginTop: 16, textAlign: 'center' }}>
                  Forgot Password?
                </Heading>
                <Text style={{ 
                  textAlign: 'center', 
                  marginTop: 8, 
                  color: theme.colors.onSurfaceVariant,
                  lineHeight: 20
                }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>
              </View>

              <View style={{ gap: 16 }}>
                <View>
                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={handleEmailChange}
                    left={<TextInput.Icon icon={() => <Mail size={20} color={theme.colors.onSurfaceVariant} />} />}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!emailError}
                    disabled={loading}
                    placeholder="Enter your email address"
                  />
                  <HelperText type="error" visible={!!emailError}>
                    {emailError}
                  </HelperText>
                </View>

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading || !email}
                  style={{ marginTop: 8, paddingVertical: 4 }}
                  contentStyle={{ paddingVertical: 8 }}
                  icon={() => <Send size={20} color={theme.colors.onPrimary} />}
                >
                  Send Reset Link
                </Button>

                <Divider style={{ marginVertical: 16 }} />

                <View style={{ alignItems: 'center', gap: 12 }}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    Remember your password?{' '}
                    <Text 
                      style={{ color: theme.colors.primary, fontWeight: '600' }}
                      onPress={() => router.replace('/(auth)/login')}
                    >
                      Sign In
                    </Text>
                  </Text>
                  
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    Don't have an account?{' '}
                    <Text 
                      style={{ color: theme.colors.primary, fontWeight: '600' }}
                      onPress={() => router.replace('/(auth)/register')}
                    >
                      Create Account
                    </Text>
                  </Text>
                </View>
              </View>
            </Card>

            {/* Additional Help */}
            <Card style={{ marginTop: 16, padding: 16 }}>
              <Text style={{ 
                fontSize: 12, 
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                lineHeight: 16
              }}>
                Having trouble? Contact support at{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  support@waygofreight.com
                </Text>
                {' '}or call{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  +1 (555) 123-WAYGO
                </Text>
              </Text>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ForgotPasswordScreen;
