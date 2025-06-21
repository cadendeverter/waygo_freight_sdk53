// waygo-freight/app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text, Card, Button, TextInput, useTheme, Divider, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Phone, Building2, Lock, Eye, EyeOff, Check } from '../../utils/icons';
import { useAuth } from '../../state/authContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import Heading from '../../components/typography/Heading';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterScreen = () => {
  const theme = useTheme();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        phoneNumber: formData.phoneNumber
      });
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'An error occurred during registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { met: /\d/.test(formData.password), text: 'One number' }
  ];

  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{ 
          title: 'Create Account',
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
                <Heading variant="h1" style={{ color: theme.colors.primary }}>
                  Join WayGo Freight
                </Heading>
                <Text style={{ textAlign: 'center', marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                  Create your account to get started with professional freight management
                </Text>
              </View>

              <View style={{ gap: 16 }}>
                {/* Name Fields */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="First Name"
                      value={formData.firstName}
                      onChangeText={(text) => updateFormData('firstName', text)}
                      left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.onSurfaceVariant} />} />}
                      error={!!errors.firstName}
                      disabled={loading}
                    />
                    <HelperText type="error" visible={!!errors.firstName}>
                      {errors.firstName}
                    </HelperText>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="Last Name"
                      value={formData.lastName}
                      onChangeText={(text) => updateFormData('lastName', text)}
                      error={!!errors.lastName}
                      disabled={loading}
                    />
                    <HelperText type="error" visible={!!errors.lastName}>
                      {errors.lastName}
                    </HelperText>
                  </View>
                </View>

                {/* Email */}
                <View>
                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text.toLowerCase())}
                    left={<TextInput.Icon icon={() => <Mail size={20} color={theme.colors.onSurfaceVariant} />} />}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                    disabled={loading}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>
                </View>

                {/* Company */}
                <View>
                  <TextInput
                    label="Company Name"
                    value={formData.company}
                    onChangeText={(text) => updateFormData('company', text)}
                    left={<TextInput.Icon icon={() => <Building2 size={20} color={theme.colors.onSurfaceVariant} />} />}
                    error={!!errors.company}
                    disabled={loading}
                  />
                  <HelperText type="error" visible={!!errors.company}>
                    {errors.company}
                  </HelperText>
                </View>

                {/* Phone */}
                <View>
                  <TextInput
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChangeText={(text) => updateFormData('phoneNumber', text)}
                    left={<TextInput.Icon icon={() => <Phone size={20} color={theme.colors.onSurfaceVariant} />} />}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    error={!!errors.phoneNumber}
                    disabled={loading}
                  />
                  <HelperText type="error" visible={!!errors.phoneNumber}>
                    {errors.phoneNumber}
                  </HelperText>
                </View>

                {/* Password */}
                <View>
                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    left={<TextInput.Icon icon={() => <Lock size={20} color={theme.colors.onSurfaceVariant} />} />}
                    right={
                      <TextInput.Icon 
                        icon={() => showPassword ? <EyeOff size={20} color={theme.colors.onSurfaceVariant} /> : <Eye size={20} color={theme.colors.onSurfaceVariant} />}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    error={!!errors.password}
                    disabled={loading}
                  />
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password}
                  </HelperText>
                  
                  {/* Password Requirements */}
                  {formData.password.length > 0 && (
                    <View style={{ marginTop: 8, paddingHorizontal: 12 }}>
                      <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                        Password Requirements:
                      </Text>
                      {passwordRequirements.map((req, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                          <Check 
                            size={12} 
                            color={req.met ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                          />
                          <Text 
                            style={{ 
                              fontSize: 11, 
                              marginLeft: 4,
                              color: req.met ? theme.colors.primary : theme.colors.onSurfaceVariant 
                            }}
                          >
                            {req.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View>
                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    left={<TextInput.Icon icon={() => <Lock size={20} color={theme.colors.onSurfaceVariant} />} />}
                    right={
                      <TextInput.Icon 
                        icon={() => showConfirmPassword ? <EyeOff size={20} color={theme.colors.onSurfaceVariant} /> : <Eye size={20} color={theme.colors.onSurfaceVariant} />}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    disabled={loading}
                  />
                  <HelperText type="error" visible={!!errors.confirmPassword}>
                    {errors.confirmPassword}
                  </HelperText>
                </View>

                {/* Register Button */}
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  style={{ marginTop: 16, paddingVertical: 4 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  Create Account
                </Button>

                <Divider style={{ marginVertical: 16 }} />

                {/* Login Link */}
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    Already have an account?{' '}
                    <Text 
                      style={{ color: theme.colors.primary, fontWeight: '600' }}
                      onPress={() => router.replace('/(auth)/login')}
                    >
                      Sign In
                    </Text>
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default RegisterScreen;
