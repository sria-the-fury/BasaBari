import React, {useContext, useRef, useState} from "react";
import {
    Modal,
    ScrollView,
    View,
    StyleSheet,
    ToastAndroid,
    Linking,
    Vibration,
    ImageBackground,
} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import { Icon} from "react-native-elements";
import {Avatar} from "react-native-paper";
import {Colors} from "../components/utilities/Colors";
import _ from 'lodash';
import moment from "moment";
import {FirebaseContext} from "../context/FirebaseContext";
import {ChatBubbleAndMessageReadTime} from "../components/chat/ChatBubbleAndMessageReadTime";
import PushNotification from "react-native-push-notification";


export const ChatModal = (props) => {
    const {modalVisible, modalHide, message, ToUserInfo, IncludeListing, currentUserId, notifications} = props;
    const firebase = useContext(FirebaseContext);

    const firstName = ToUserInfo?.userName.split(' ');

    const [sendMessage, setSendMessage] = useState('');


    const SendMessage = async (messageId) => {

        try{
            // ScrollViewRef.current.scrollToEnd({animated: true});
            await firebase.sendMessageAtMessageScreen(messageId, currentUserId, sendMessage);
            setSendMessage('');
            await firebase.createNotification(ToUserInfo.id, currentUserId, false, messageId, IncludeListing.id, sendMessage);

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
    };

    const LastSeen = (time) => {
        const getDayDifference =  Math.round((new Date().getTime() - new Date(time).getTime())/(1000*3600*24));
        return(
            <TextComponent extraTiny color={'white'} style={{ marginLeft: 3}}>
               {getDayDifference > 0 ? moment(time).calendar() : moment(time).startOf('minutes').fromNow()}
            </TextComponent>
        )
    };

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

                    <NameAndOnlineStatus>
                        <NameAndPhone>
                            <Icon name={'call'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'white'} onPress={() => cellularCall(ToUserInfo?.phoneNumber)}/>
                            <TextComponent bold semiLarge color={'white'}>  {ToUserInfo ? firstName[0] : null}</TextComponent>
                        </NameAndPhone>

                        { ToUserInfo?.isOnline || ToUserInfo?.lastSeen ?
                            <IsUserOnline>
                                {ToUserInfo.isOnline ? <Icon name={'ellipse'} type={'ionicon'} size={10} color={'#18f73d'}/> : null}
                                {
                                    ToUserInfo?.isOnline ? <TextComponent tiny color={'white'} style={{marginLeft: 2}}>
                                            Online
                                        </TextComponent> :
                                        !ToUserInfo?.isOnline && ToUserInfo?.lastSeen ? LastSeen(ToUserInfo?.lastSeen): null
                                }
                            </IsUserOnline> : null
                        }


                    </NameAndOnlineStatus>

                    <ListingInfo>
                        <Icon name={'home'} type={'ionicon'} size={10} color={'white'} style={{marginRight: 5}}/>
                        <TextComponent style={{ flex:1,
                            flexWrap: 'wrap'}} tiny color={'white'} numberOfLines={3}>  {IncludeListing.address}, {IncludeListing.location.city}</TextComponent>
                    </ListingInfo>

                </ModalHeader>

                <ImageBackground source={require('../../assets/chat-bg.jpg')} style={{flex:1, justifyContent: "center", resizeMode: 'cover'}}>
                    <ScrollView showsVerticalScrollIndicator={false} ref={ScrollViewRef}
                                onContentSizeChange={ async (contentWidth, contentHeight)=>{
                                    ScrollViewRef.current.scrollToEnd({animated: true});
                                    if(lastMessage.senderId !== currentUserId && !lastMessage.read) Vibration.vibrate(30);
                                    await messageActions();
                                    PushNotification.removeAllDeliveredNotifications();

                                    if(notifications.length > 0 ) await firebase.readNotifications(notifications, true);
                                }}
                    >

                        <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                            { message.messages.map((eachMessage, key= 0) =>
                                <View key={key}
                                      style={{flexDirection: currentUserId === eachMessage.senderId ? 'row-reverse' : 'row',
                                          alignItems: "center",
                                          alignSelf: currentUserId === eachMessage?.senderId ? 'flex-end' : 'flex-start'}}>

                                    { currentUserId !== eachMessage.senderId ?
                                        <View>
                                            <Avatar.Image size={35} source={{uri: ToUserInfo?.profilePhotoUrl}} style={{ marginRight: 5}}/>
                                            { ToUserInfo?.isOnline ?
                                                <View style={{position: 'absolute', bottom: 0, right: 6, backgroundColor: 'white',
                                                    borderColor: 'white', borderRadius: 6, borderWidth: 2, height: 12, width: 12}}>

                                                    <View style={{backgroundColor: '#18f73d', height: 8, width: 8, borderRadius: 4}}/>
                                                </View> : null
                                            }
                                        </View>
                                        : null }


                                    {<ChatBubbleAndMessageReadTime currentUserId={currentUserId}
                                                                   eachMessage={eachMessage} lastMessage={lastMessage}/>}

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
                </ImageBackground>

            </ModalView>
        </Modal>
    );
};

const StatusBarAndTopHeaderBGColor = '#d0ff00';

const ModalView = styled.View`
                                backgroundColor: white;
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

const NameAndOnlineStatus = styled.View`

                                alignItems: center;
                                `;

const NameAndPhone = styled.View`
                                flexDirection: row;
                                alignItems: center;
                                `;

const IsUserOnline = styled.View`
                                flexDirection: row;
                                alignItems: center;

                                `

const SendMessageBox = styled.TextInput`
                                borderRadius: 20px;
                                color: white;
                                backgroundColor: ${Colors.primaryBodyLight};
                                paddingHorizontal: 15px;
                                paddingVertical: 8px;
                                marginBottom: 5px;
                                maxHeight: 100px;
                                fontSize: 15px;
                                `;

const MessageSendMainContainer = styled.View`
                                paddingHorizontal: 5px;
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
