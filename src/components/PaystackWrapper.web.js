import React from 'react';
import { View, Text } from 'react-native';

export default function PaystackWrapper(props) {
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>
        Paystack Web View is not supported on web. Please use standard web checkout.
      </Text>
    </View>
  );
}
