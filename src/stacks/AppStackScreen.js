import React, {useContext, useEffect, useState} from 'react';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import AuthStackScreen from './AuthStackScreen';
import MainStackScreen from "./MainStackScreen";
import AddListingScreen from "../screens/AddListingScreen";
import {UserContext} from "../context/UserContext";

import MyListingScreen from "../screens/MyListingsScreen";
import InitialUpdateProfile from "../screens/InitialUpdateProfile";
import {ListingDetailsScreen} from "../screens/ListingDetailsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MessagesScreen from "../screens/MessagesScreen";
import {FirebaseContext} from "../context/FirebaseContext";
import firestore from "@react-native-firebase/firestore";
import {LoadingScreen} from "../screens/LoadingScreen";


export default function AppStackScreen() {
    const firebase = useContext(FirebaseContext)
    const currentUser = firebase.getCurrentUser();
    const AppStack = createStackNavigator();
    const[user] = useContext(UserContext);

    if(user.isLoggedIn === true && user.userType){
        return (
            <AppStack.Navigator headerMode="none">

                <AppStack.Screen name={'Main'} component={MainStackScreen}
                                 options={{
                                     ...TransitionPresets.SlideFromRightIOS, gestureDirection: 'vertical-inverted'
                                 }}/>

                <AppStack.Screen name={'AddListing'} component={AddListingScreen} options={{
                    ...TransitionPresets.ModalSlideFromBottomIOS
                }}/>
                {/*<AppStack.Screen name={'MyListings'} component={MyListingScreen} options={{*/}
                {/*    ...TransitionPresets.SlideFromRightIOS, gestureDirection: 'vertical-inverted'*/}
                {/*}}/>*/}

                <AppStack.Screen name={'ListingDetails'} component={ListingDetailsScreen} options={{
                    ...TransitionPresets.SlideFromRightIOS, gestureDirection: 'vertical-inverted'
                }}/>

                <AppStack.Screen name={'ProfileScreen'} component={ProfileScreen}
                                 options={{
                                     ...TransitionPresets.SlideFromRightIOS, gestureDirection: 'vertical-inverted'
                                 }}/>


            </AppStack.Navigator>
        );
    }
    else if(user.isLoggedIn === false){
        return (
            <AppStack.Navigator headerMode="none">
                <AppStack.Screen name={'InitialProfileUpdate'} component={InitialUpdateProfile}
                                 options={{
                                     ...TransitionPresets.SlideFromRightIOS, gestureDirection: 'vertical-inverted'
                                 }}/>
            </AppStack.Navigator>
        )

    }
    else if(user.isLoggedIn === null && user.userType === null){
        return (
            <AppStack.Navigator headerMode="none">
                <AppStack.Screen name={'Auth'} component={AuthStackScreen} />
            </AppStack.Navigator>

        )
    }

    else{
        return (
            <AppStack.Navigator headerMode="none">
                <AppStack.Screen name={'Loading'} component={LoadingScreen} />
            </AppStack.Navigator>
        )
    }

}
