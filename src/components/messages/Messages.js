import React, {useContext, useState, useRef} from 'react'
import { TouchableOpacity, StyleSheet, Vibration, ToastAndroid} from 'react-native'
import {ChatModal} from "../../modals/ChatModal";
import _ from "lodash";
import {FirebaseContext} from "../../context/FirebaseContext";
import {Icon} from "react-native-elements";
import {TextComponent} from "../TextComponent";
import RBSheet from "react-native-raw-bottom-sheet";
import {Colors} from "../utilities/Colors";

export const Messages = ({children, message, users, listingData, notifications}) => {
    const firebase = useContext(FirebaseContext);
    const currentUserId = firebase.getCurrentUser().uid;
    const thisMessageNotifications = _.filter(notifications, {messageId: message.id, notifyTo: currentUserId, read: false});

    const messageAction = useRef();
    const [selectedMessage, setSelectedMessage] = useState(false);
    const thisMessageReadNotifications = _.filter(notifications, {messageId: message.id});


    const [openChatModal, setChatModal] = useState(false);
    const includeListing = _.find(listingData, {listingId : message.listingId}) ;
    const ToUserInfo = (includeListing?.userId === currentUserId) && (currentUserId === message.listingOwnerId) ? _.find(users, {id : message.interestedTenantId}) : _.find(users, {id : message.listingOwnerId});

    const deleteMessage = async (messageId, listingId, interestedTenantId, deleteNotifications) => {
        try{
            await firebase.deleteMessage(messageId, listingId, interestedTenantId, deleteNotifications);

        } catch (e) {
            ToastAndroid.show(e.message+' @delete message', ToastAndroid.SHORT);
        }
        finally {
            ToastAndroid.show('Message Deleted', ToastAndroid.SHORT);
        }
    }
    return (
        <TouchableOpacity onPress={() => setChatModal(true)}
                          onLongPress={() => {
                              setSelectedMessage(!selectedMessage);
                              Vibration.vibrate(30);
                              messageAction.current.open();
                          }}
                          style={{backgroundColor: selectedMessage ? 'lavender' : 'white'}}
        >
            {children}

            <RBSheet
                ref={messageAction}
                closeOnDragDown={true}
                closeOnPressMask={true}
                dragFromTopOnly={true}
                height={80}
                onClose={() => setSelectedMessage(false)}

                customStyles={{
                    wrapper: {
                        backgroundColor: "transparent"
                    },
                    container: styles.sheetContainer,

                }}>
                <TouchableOpacity style={styles.deleteMessage} onPress={ async () => {
                    messageAction.current.close();
                    Vibration.vibrate(30);
                    await deleteMessage(message.id, message.listingId, message.interestedTenantId, thisMessageReadNotifications);
                }}>
                    <Icon name={'trash'} type={"ionicon"} size={15} raised color={'red'}/>
                    <TextComponent medium color={'white'}>Delete Message</TextComponent>

                </TouchableOpacity>



            </RBSheet>

            <ChatModal modalVisible={openChatModal}
                       modalHide={setChatModal} message={message} ToUserInfo={ToUserInfo}
                       IncludeListing={includeListing} currentUserId={currentUserId} notifications={thisMessageNotifications}/>
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    sheetContainer : {
        backgroundColor: Colors.primaryBody,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        shadowColor: '#000',
        shadowRadius: 5,
        elevation:10,
        shadowOpacity: 1

    },
    deleteMessage: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'


    }
});
