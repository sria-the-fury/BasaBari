import React from 'react';
import { Animated, StyleSheet, View,Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function MessageScreen() {
   const renderLeftActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });
        return (
            <RectButton style={styles.leftAction} >
                <Animated.Text
                    style={[
                        styles.actionText,
                        {
                            transform: [{ translateX: trans }],
                        },
                    ]}>
                    Archive
                </Animated.Text>
            </RectButton>
        );
    };

  return (
      <Swipeable renderLeftActions={renderLeftActions} containerStyle={styles.container} >
          <Text>"hello"</Text>
      </Swipeable>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'cyan'

    },
    leftAction: {
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    }
});
