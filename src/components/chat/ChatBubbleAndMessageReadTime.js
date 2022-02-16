import React from 'react'
import {View, StyleSheet} from 'react-native'
import {TextComponent} from "../TextComponent";
import moment from "moment";
import {Icon} from "react-native-elements";

export const ChatBubbleAndMessageReadTime = (props) => {
    const {currentUserId, eachMessage, lastMessage} = props;


    const ChatBubble = (eachMessage) => {

        return(
            <TextComponent selectable={true} color={currentUserId === eachMessage.senderId ? 'white': 'black'}>
                {eachMessage.message}
            </TextComponent>
        )

    };

    const sentAtTime = (time) => {
        const sentAt = new Date(time * 1000),
            todayDate = new Date(),
            getDayDifference =  Math.round((todayDate.getTime() - sentAt.getTime())/(1000*3600*24));
        if(getDayDifference > 25) return moment(sentAt).format('ddd, Do MMM YYYY');
        else if(getDayDifference < 7 ){
            if(getDayDifference < 1)  return moment(sentAt).startOf('minutes').fromNow();
            else return moment(sentAt).calendar();
        } else return moment(sentAt).startOf('minutes').fromNow();
    };

    const ChatSentTime = ( time, senderId ) => {

        return(
            <TextComponent extraTiny style={currentUserId === senderId ? { textAlign: 'right', color: 'rgba(255, 255, 255, 0.7)'} : {marginLeft: 0}} color={'grey'}>
                {sentAtTime(time)}
            </TextComponent>

        )
    };

    const MessageSeenTime = (time) => {
        const getDayDifference =  Math.round((new Date().getTime() - new Date(time).getTime())/(1000*3600*24));
        return(
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                <Icon name={'checkmark-done-outline'} color={'#5c8ef2'} type={'ionicon'} size={10}/>
                <TextComponent extraTiny color={'grey'} style={{ textAlign: 'right'}}>
                    {getDayDifference > 0 ? moment(time).calendar() : moment(time).startOf('minutes').fromNow()}
                </TextComponent>
            </View>

        )
    };


    return (
        <View style={{width: '75%', marginVertical: 2}}>
            <View style={[{backgroundColor: currentUserId !== eachMessage?.senderId ? 'cyan' : '#49478e',
                paddingHorizontal: 10, paddingVertical: 5, maxWidth: '100%'}, currentUserId === eachMessage?.senderId ? styles.rightAlignMessage : styles.leftAlignMessage]}
            >
                {ChatBubble(eachMessage)}
                {ChatSentTime(eachMessage.sentAt.seconds, eachMessage?.senderId)}
            </View>
            {eachMessage.read && eachMessage.readAt && eachMessage?.senderId === currentUserId && lastMessage.id === eachMessage.id ?
                MessageSeenTime(eachMessage.readAt) : null}


        </View>
    )
}


const styles = StyleSheet.create({
    leftAlignMessage: {
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignSelf: 'flex-start'
    },
    rightAlignMessage: {
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        alignSelf: 'flex-end'

    },

})