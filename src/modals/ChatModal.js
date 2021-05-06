import React, {useContext, useRef, useState} from "react";
import {Modal, ScrollView, View, StyleSheet, ToastAndroid, Linking, Pressable, Vibration} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {Avatar} from "react-native-paper";
import {Colors} from "../components/utilities/Colors";
import _ from 'lodash';
import moment from "moment";
import {FirebaseContext} from "../context/FirebaseContext";
import {ChatBubbleAndMessageReadTime} from "../components/chat/ChatBubbleAndMessageReadTime";


export const ChatModal = (props) => {
    const {modalVisible, modalHide, message, ToUserInfo, IncludeListing, currentUserId, notifications} = props;
    const firebase = useContext(FirebaseContext);

    const firstName = ToUserInfo.userName.split(' ');

    const [sendMessage, setSendMessage] = useState('');


    const SendMessage = async (messageId) => {

        try{
            // ScrollViewRef.current.scrollToEnd({animated: true});
            await firebase.sendMessageAtMessageScreen(messageId, currentUserId, sendMessage);
            setSendMessage('');
            await firebase.createNotification(ToUserInfo.id, currentUserId, false, messageId);

        } catch (e) {
            ToastAndroid.show(e.message+ '@front sent msg', ToastAndroid.LONG);
        } finally {
            // ScrollViewRef.current.scrollToEnd({animated: true});
            setSendMessage('');

        }

    };

    const ScrollViewRef = useRef();

    const [hideSend, setHideSend] = useState(false);


    const unreadMessage = _.filter(message.messages, {read: false});
    const lastMessage = message.messages.length > 0 ? message.messages[message.messages.length-1] : message.messages[0];

    const messageActions = async () => {

        if(unreadMessage.length > 0 && lastMessage.senderId !== currentUserId ) {
            await firebase.readMessages(message.messages, message.id, true);

        }
    };

    const cellularCall = async (number) => {
        await Linking.openURL('tel:'+number);
    }


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                modalHide(false)
            }}
        >
            <ModalView>
                <ModalHeader style={{backgroundColor: Colors.primaryBody}}>
                    <Icon name={'chevron-down-outline'} type={'ionicon'} size={35} color={ 'white'} onPress={() => modalHide(false)}/>

                    <NameAndAvatar>
                        <Icon name={'call'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'white'} onPress={() => cellularCall(ToUserInfo.phoneNumber)}/>
                        <TextComponent bold semiLarge color={'white'}>  {firstName[0]}</TextComponent>

                    </NameAndAvatar>

                    <ListingInfo>
                        <Icon name={'home'} type={'ionicon'} size={10} color={'white'} style={{marginRight: 5}}/>
                        <TextComponent left style={{ flex:1,
                            flexWrap: 'wrap'}} numberOfLines={2} tiny color={'white'} multiline={true}>  {IncludeListing.address}, {IncludeListing.location.city}</TextComponent>
                    </ListingInfo>

                </ModalHeader>
                <ScrollView showsVerticalScrollIndicator={false} ref={ScrollViewRef}
                            onContentSizeChange={ async (contentWidth, contentHeight)=>{
                                ScrollViewRef.current.scrollToEnd({animated: true});
                                if(lastMessage.senderId !== currentUserId && !lastMessage.read) Vibration.vibrate(20);
                                await messageActions();

                                if(notifications.length > 0 ) await firebase.readNotifications(notifications, true);
                            }}
                >

                    <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                        { message.messages.map((eachMessage, key= 0) =>
                            <View key={key}
                                  style={{flexDirection: currentUserId === eachMessage.senderId ? 'row-reverse' : 'row',
                                      alignItems: "center",
                                      alignSelf: currentUserId === eachMessage?.senderId ? 'flex-end' : 'flex-start'}}>

                                { currentUserId !== eachMessage.senderId ? <Avatar.Image size={35} source={{uri: ToUserInfo.profilePhotoUrl}} style={{ marginRight: 5}}/> : null }


                                {<ChatBubbleAndMessageReadTime currentUserId={currentUserId}
                                                               eachMessage={eachMessage}/>}

                            </View>)
                        }
                    </View>
                </ScrollView>
                <MessageSendMainContainer>
                    <SendMessageBox placeholder={'Send your Message'} placeholderTextColor={'grey'} multiline={true}
                                    style={{width: hideSend ? '88%' : '100%'}}
                                    defaultValue={sendMessage}
                                    onChangeText={(text) => setSendMessage(text)}
                                    onBlur={() => setHideSend(false)}
                                    onFocus={() =>{
                                        setHideSend(true);
                                        ScrollViewRef.current.scrollToEnd({animated: true});
                                    }}
                    />
                    { hideSend ?
                        <Icon reverse raised name={'send'} type={'md'} size={15} style={{marginHorizontal: 5}}
                              disabledStyle={{backgroundColor: Colors.primaryBody}}
                              underlayColor={'rgba(255, 255, 255, 0.6)'}
                              reverseColor={sendMessage.trim() === '' ? Colors.primaryBodyLight : 'white'}

                              color={Colors.primaryBody} onPress={() => SendMessage(message.id)}
                              disabled={sendMessage.trim() === ''}/> : null
                    }

                </MessageSendMainContainer>

            </ModalView>
        </Modal>
    );
};

const StatusBarAndTopHeaderBGColor = '#d0ff00';

const ModalView = styled.View`
                            backgroundColor: white;
                            shadowColor: #000;
                            shadowOpacity: 0.25;
                            shadowRadius: 4px;
                            elevation: 5;
                            height:100%;

                            `;

const ModalHeader = styled.View`
                         
                            width:100%;
                            flexDirection: row;
                            alignItems: center;
                            paddingVertical:10px;
                            paddingHorizontal:20px;
                            justifyContent: space-between;
                            `;

const ListingInfo = styled.View`
                            flexDirection: row;
                            maxWidth: 45%;
                            alignItems: center;
                            justifyContent: flex-end;
                            `

const NameAndAvatar = styled.View`
                            marginLeft: 20px;
                            flexDirection: row;
                            alignItems: center;
                            `;

const SendMessageBox = styled.TextInput`
borderRadius: 20px;
color: white;
backgroundColor: ${Colors.primaryBodyLight};
paddingHorizontal: 15px;
paddingVertical: 7px;
maxHeight: 100px;
fontSize: 15px;
`;

const MessageSendMainContainer = styled.View`
backgroundColor: ${Colors.primaryBody};
paddingHorizontal: 5px;
paddingVertical: 5px
flexDirection: row;
alignItems: center;
justifyContent: space-between;
`



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
