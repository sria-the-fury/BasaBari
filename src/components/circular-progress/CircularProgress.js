import React from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import Svg, {G, Circle} from "react-native-svg";

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
                    <Circle stroke={"#E6E7E8"} cx={center} cy={center} r={radius} strokeWidth={strokeWidth}/>
                    <Circle stroke={"#F4338F"} cx={center} cy={center}
                            r={radius} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference + (circumference * fillRatio)/percentage}/>
                </G>

            </Svg>
        </View>
    )
}