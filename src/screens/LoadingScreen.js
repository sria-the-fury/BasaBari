import React from 'react'
import { View, Text } from 'react-native'
import {TextComponent} from "../components/TextComponent";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";
import LottieView from "lottie-react-native";

export const LoadingScreen = (props) => {
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