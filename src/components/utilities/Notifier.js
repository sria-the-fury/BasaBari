import React, {useState} from 'react'
import { View, Text } from 'react-native'
import {TextComponent} from "../TextComponent";
import {Snackbar} from "react-native-paper";

export const Notifier = (message, type) => {
    console.log('message=>', message);
    console.log('type=>', type);

    return(
        <NotifierBody message={message} type={type}/>
    )
}

export const NotifierBody = ({message, type}) => {
    const [visibleNotifier, setNotifier] = useState(false);
    const [color, setColor] = useState('black');
    switch (type) {
        case 'success' :
            setNotifier(true);
            setColor('green');
            break;
        case 'error' :
            setNotifier(true);
            setColor('red');
            break;
        default:
            setNotifier(false);
            setColor('black');


    }

    return (
        <Snackbar
            style={{backgroundColor: color}}
            visible={visibleNotifier}
            onDismiss={() => setNotifier(false)}
            action={{
                label: 'Undo',
                onPress: () => {
                    // Do something
                },
            }}>
            <TextComponent bold color={'white'} medium>{message}</TextComponent>
        </Snackbar>
    )
}