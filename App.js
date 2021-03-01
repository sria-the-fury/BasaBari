import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppStackScreen from './src/stacks/AppStackScreen';
import {UserProvider} from "./src/context/UserContext";
import {FirebaseProvider} from "./src/context/FirebaseContext";

export default function App() {
    return (
        <FirebaseProvider>
            <UserProvider>
                <NavigationContainer>
                    <AppStackScreen />
                </NavigationContainer>
            </UserProvider>
        </FirebaseProvider>

    );
}
