import React, {useContext} from 'react';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import AuthStackScreen from './AuthStackScreen';
import MainStackScreen from "./MainStackScreen";
import AddListingScreen from "../screens/AddListingScreen";
import {UserContext} from "../context/UserContext";

import MyListingScreenAsModal from "../screens/MyListingsScreenAsModal";
import InitialUpdateProfile from "../screens/InitialUpdateProfile";


export default function AppStackScreen() {
    const AppStack = createStackNavigator();
    const[user] = useContext(UserContext);

    if(user.isLoggedIn === true ){
        return (
            <AppStack.Navigator headerMode="none">

                <AppStack.Screen name={'Main'} component={MainStackScreen}/>

                <AppStack.Screen name={'AddListingModalScreen'} component={AddListingScreen} options={{
                    ...TransitionPresets.ModalSlideFromBottomIOS
                }}/>
                <AppStack.Screen name={'MyListingsAsModal'} component={MyListingScreenAsModal} options={{
                    ...TransitionPresets.ModalSlideFromBottomIOS
                }}/>


            </AppStack.Navigator>
        );
    }
    else if(user.isLoggedIn === false){
        return (
            <AppStack.Navigator headerMode="none">
                <AppStack.Screen name={'InitialProfileUpdate'} component={InitialUpdateProfile}/>
            </AppStack.Navigator>
        )

    }
    else if(user.isLoggedIn === null){
        return (
            <AppStack.Navigator headerMode="none">
                <AppStack.Screen name={'Auth'} component={AuthStackScreen} />
            </AppStack.Navigator>

        )
    }

}
