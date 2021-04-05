import React from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import Svg, {G, Circle} from "react-native-svg";
import {Colors} from "../utilities/Colors";

export const CircularProgress = (props) => {

    const {fillRatio, percentage, size } = props;

    const strokeWidth = 20;
    const center = size/2;
    const radius = size/ 2 - strokeWidth /2 ;
    const circumference = 2 * Math.PI * radius;

    return (
        <View>
            <Svg width={size} height={size}>
                <G rotation={'-90'} origin={center}>

                    <Circle stroke={Colors.primaryBodyLight} cx={center} cy={center} r={radius} strokeWidth={strokeWidth}/>
                    <Circle stroke={Colors.primaryBody} cx={center} cy={center}
                            r={radius} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * fillRatio)/percentage}/>

                </G>

            </Svg>
        </View>
    )
}