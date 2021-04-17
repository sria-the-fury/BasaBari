import React, {useContext, useRef, useState} from "react";
import {Modal, ScrollView, View, StyleSheet, ToastAndroid, Linking} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {Avatar} from "react-native-paper";
import {Colors} from "../components/utilities/Colors";
import _ from 'lodash';
import moment from "moment";
import {FirebaseContext} from "../context/FirebaseContext";

export const ChatModal = (props) => {
    const {modalVisible, modalHide, message, ToUserInfo, IncludeListing, currentUserId} = props;
    const firebase = useContext(FirebaseContext);


    const firstName = ToUserInfo.userName.split(' ');

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
            <TextComponent tiny style={currentUserId === senderId ? { textAlign: 'right'} : {marginLeft: 0}} color={'grey'}>
                {sentAtTime(time)}
            </TextComponent>

        )
    };

    const [sendMessage, setSendMessage] = useState('');


    const SendMessage = async (messageId) => {

        try{
            // ScrollViewRef.current.scrollToEnd({animated: true});
            await firebase.sendMessageAtMessageScreen(messageId, currentUserId, sendMessage);
            setSendMessage('');
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

    const messageActions = () => {

        if(unreadMessage.length > 0 && lastMessage.senderId !== currentUserId ) {
            _.each(unreadMessage, async (eachMessage) => await firebase.readMessages(eachMessage.id, message.id, true, eachMessage));
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
                            onContentSizeChange={(contentWidth, contentHeight)=>{
                                messageActions();
                                ScrollViewRef.current.scrollToEnd({animated: true}); }}
                >

                    <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                        { message.messages.map((eachMessage, key= 0) =>
                                <View key={key}  style={{flexDirection: currentUserId === eachMessage.senderId ? 'row-reverse' : 'row', alignItems: "center", alignSelf: currentUserId === eachMessage?.senderId ? 'flex-end' : 'flex-start'}}>

                                    { currentUserId !== eachMessage.senderId ? <Avatar.Image size={35} source={{uri: ToUserInfo.profilePhotoUrl}} style={{ marginRight: 5}}/> :

                                       <View>
                                           <Avatar.Image size={25} source={{uri: ToUserInfo.profilePhotoUrl}} style={{ marginLeft: 3}}/>
                                           <View style={{position: 'absolute', bottom:0, right: 0, backgroundColor: 'white', borderRadius: 50}}>
                                               <Icon name={'visibility'} type={'md'} size={15} color={eachMessage.read ? 'green' : 'grey'}/>

                                           </View>
                                       </View>

                                    }
                                    <View style={{width: '75%', marginVertical: 5,}}>
                                        <View style={[{backgroundColor: currentUserId !== eachMessage?.senderId ? 'cyan' : '#49478e',
                                            paddingHorizontal: 10, paddingVertical: 10, maxWidth: '100%'}, currentUserId === eachMessage?.senderId ? styles.rightAlignMessage : styles.leftAlignMessage]}>
                                            {ChatBubble(eachMessage)}
                                        </View>
                                        {ChatSentTime(eachMessage.sentAt.seconds, eachMessage?.senderId)}

                                    </View>

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
                                        console.log('focused');
                                        setHideSend(true);
                                        ScrollViewRef.current.scrollToEnd({animated: true});
                                    }}
                    />
                    { hideSend ?
                        <Icon reverse name={'send'} type={'md'} size={15} style={{marginLeft: 5}} color={sendMessage.trim() ==='' ? 'grey' : '#8eabf2'} onPress={() => SendMessage(message.id)}
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
borderWidth: 1px;
borderColor: lavender;
borderRadius: 10px;
color: white;
backgroundColor: ${Colors.primaryBody};
paddingHorizontal: 10px;
maxHeight: 70px;
fontSize: 18px;
`;

const MessageSendMainContainer = styled.View`
backgroundColor: ${Colors.primaryBody};
paddingHorizontal: 10px;
paddingVertical: 10px;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
borderTopLeftRadius: 15px;
borderTopRightRadius: 15px;
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
