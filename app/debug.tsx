import React from 'react';
import { View, Text } from 'react-native';

export default function DebugScreen() {
  console.log('DebugScreen rendering...');
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Debug Screen Loaded Successfully</Text>
    </View>
  );
}
