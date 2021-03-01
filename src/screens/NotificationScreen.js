import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Text>Hello, NotificationScreen </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'

    }
});