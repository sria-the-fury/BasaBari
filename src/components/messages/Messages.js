import React, {useContext, useState} from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import {ChatModal} from "../../modals/ChatModal";
import _ from "lodash";
import {FirebaseContext} from "../../context/FirebaseContext";

export const Messages = ({children, message, users, listingData}) => {
    const firebase = useContext(FirebaseContext);
    const currentUserId = firebase.getCurrentUser().uid;

    const unreadMessage = _.filter(message.messages, {read: false});
    const lastMessage = message.messages.length > 0 ? message.messages[message.messages.length-1] : message.messages[0];

    const [openChatModal, setChatModal] = useState(false);
    const includeListing = _.find(listingData, {listingId : message.listingId}) ;
    const ToUserInfo = (includeListing.userId === currentUserId) && (currentUserId === message.listingOwnerId) ? _.find(users, {id : message.senderId}) : _.find(users, {id : message.listingOwnerId});

    const messageActions = () => {

        if(unreadMessage.length > 0 && lastMessage.senderId !== currentUserId ){
            _.each(unreadMessage, async (eachMessage) => await firebase.readMessages(eachMessage.id, message.id, true, eachMessage));
            setChatModal(true);


        } else setChatModal(true);

    }

    return (
        <TouchableOpacity onPress={() => messageActions()}>
            {children}
            <ChatModal modalVisible={openChatModal} modalHide={setChatModal} message={message} ToUserInfo={ToUserInfo} IncludeListing={includeListing} currentUserId={currentUserId}/>
        </TouchableOpacity>
    )
}