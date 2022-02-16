import React, {useContext, useEffect} from 'react'
import { View, Text } from 'react-native'
import {TextComponent} from "../components/TextComponent";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";
import LottieView from "lottie-react-native";
import {FirebaseContext} from "../context/FirebaseContext";
import {UserContext} from "../context/UserContext";
import firestore from "@react-native-firebase/firestore";

export const LoadingScreen = (props) => {
    const firebase = useContext(FirebaseContext);
    const [user] = useContext(UserContext);
    const [_,setUser] = useContext(UserContext);
    const currentUser = firebase.getCurrentUser();

    useEffect(() => {

        const userSubscriber = firestore().collection('users').doc(currentUser?.uid).onSnapshot( doc => {
            if(doc) setUser({...user, userType: doc.data().userType});
        });

        return () => userSubscriber();
    },[]);

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryBody}}>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryBody}/>

            <Text style={{color: 'white', fontSize: 30, fontFamily: 'JetBrainsMono-Regular'}}>BASA BARI</Text>
            <LottieView source={require('../../assets/lottie-animations/home.json')} autoPlay loop style={{width: 120}} />
            <View style={{alignItems: "center"}}>
                <Text style={{color: 'white', fontSize: 30, fontFamily: 'JetBrainsMono-Regular'}}>
                    FIND YOUR HOME

                </Text>
                <Text style={{color: 'white', fontSize: 20, fontFamily: 'JetBrainsMono-Light'}}>
                    Across the cities.
                </Text>

            </View>

        </View>
    )
}