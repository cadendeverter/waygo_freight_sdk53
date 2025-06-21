import React, { useState } from 'react';
import { View, Platform, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { TextInput, useTheme, Button, Surface } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from '../utils/icons';

interface DatePickerInputProps {
  label: string;
  value: Date | undefined;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  style?: any;
}

export default function DatePickerInput({
  label,
  value,
  onDateChange,
  placeholder,
  minimumDate,
  maximumDate,
  disabled = false,
  mode = 'date',
  style
}: DatePickerInputProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    
    if (mode === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (mode === 'datetime') {
      return date.toLocaleString();
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      
      if (selectedDate && event.type !== 'dismissed') {
        onDateChange(selectedDate);
      }
    } else {
      // iOS - just update the value, don't close yet
      if (selectedDate) {
        onDateChange(selectedDate);
      }
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      minWidth: 300,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      zIndex: 10000,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 12,
    }
  });

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={formatDate(value)}
        onPressIn={handlePress}
        placeholder={placeholder}
        mode="outlined"
        editable={false}
        disabled={disabled}
        right={
          <TextInput.Icon 
            icon={() => <Calendar size={20} color={theme.colors.onSurfaceVariant} />}
            onPress={handlePress}
            disabled={disabled}
          />
        }
        style={{ backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.surface }}
      />
      
      {/* iOS uses Modal, Android uses native picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={false}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={1}
              onPress={handleCancel}
            >
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <Surface style={styles.modalContent} elevation={4}>
                  <DateTimePicker
                    value={value || new Date()}
                    mode={mode}
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    textColor={theme.colors.onSurface}
                  />
                  <View style={styles.buttonRow}>
                    <Button 
                      mode="outlined" 
                      onPress={handleCancel}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={handleConfirm}
                      style={{ flex: 1 }}
                    >
                      Confirm
                    </Button>
                  </View>
                </Surface>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      
      {/* Android native picker */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}
