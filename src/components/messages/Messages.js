import React, {useContext, useState} from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import {ChatModal} from "../../modals/ChatModal";
import _ from "lodash";
import {FirebaseContext} from "../../context/FirebaseContext";

export const Messages = ({children, message, users, listingData}) => {
    const firebase = useContext(FirebaseContext);
    const currentUserId = firebase.getCurrentUser().uid;


    const [openChatModal, setChatModal] = useState(false);
    const includeListing = _.find(listingData, {listingId : message.listingId}) ;
    const ToUserInfo = (includeListing.userId === currentUserId) && (currentUserId === message.listingOwnerId) ? _.find(users, {id : message.interestedTenantId}) : _.find(users, {id : message.listingOwnerId});

    return (
        <TouchableOpacity onPress={() => setChatModal(true)}>
            {children}
            <ChatModal modalVisible={openChatModal} modalHide={setChatModal} message={message} ToUserInfo={ToUserInfo} IncludeListing={includeListing} currentUserId={currentUserId}/>
        </TouchableOpacity>
    )
}