
import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    Alert,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image, Button,
} from 'react-native';
import {Snackbar} from "react-native-paper";
import {TextComponent} from "../components/TextComponent";




export default function NotificationScreen() {

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [visible, setVisible] = React.useState(false);

    const onToggleSnackBar = () => setVisible(!visible);

    const onDismissSnackBar = () => setVisible(false);

    console.log()

    const fadeIn = () => {
        // Will change fadeAnim value to 1 in 5 seconds
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        // Will change fadeAnim value to 0 in 5 seconds
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
        }).start();
    };

    return (

        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.fadingContainer,
                    {
                        opacity: fadeAnim // Bind opacity to animated value
                    }
                ]}
            >
                <Text style={styles.fadingText}>Fading View!</Text>
            </Animated.View>
            <View style={styles.buttonRow}>
                <Button title="Fade In" onPress={fadeIn} />
                <Button title="Fade Out" onPress={fadeOut} />
            </View>

            <Button onPress={onToggleSnackBar} title={visible ? 'Hide' : 'Show'}/>
            <Snackbar
                style={{backgroundColor: 'black'}}
                visible={visible}
                onDismiss={onDismissSnackBar}
                action={{
                    label: 'Undo',
                    onPress: () => {
                        // Do something
                    },
                }}>
               <TextComponent bold color={'white'} medium>Hi, I am A SnackBar</TextComponent>
            </Snackbar>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    fadingContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "powderblue"
    },
    fadingText: {
        fontSize: 28,
        textAlign: "center",
        margin: 10
    },
    buttonRow: {
        flexDirection: "row",
        marginVertical: 16
    }
});



