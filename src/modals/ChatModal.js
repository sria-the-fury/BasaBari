import React, {useContext, useState} from "react";
import {Modal, ScrollView, View, StyleSheet, TextInput, ToastAndroid} from "react-native";
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

    const ChatBubble = (message) => {

        return(
            <TextComponent selectable={true} color={'black'}>
                {message}
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
            <TextComponent tiny style={currentUserId === senderId ? { textAlign: 'right'} : {marginLeft: 45}} color={'grey'}>
                {sentAtTime(time)}
            </TextComponent>

        )
    };

    const [sendMessage, setSendMessage] = useState('');


    const SendMessage = async (messageId) => {

        try{
            await firebase.sendMessageAtMessageScreen(messageId, currentUserId, sendMessage);
            setSendMessage('');
        } catch (e) {
            ToastAndroid.show(e.message+ '@front sent msg', ToastAndroid.LONG);
        } finally {
            setSendMessage('');
        }

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
                        <Avatar.Image size={40} source={{uri: ToUserInfo.profilePhotoUrl}}/>
                        <TextComponent bold medium color={'white'}>  {firstName[0]}</TextComponent>

                    </NameAndAvatar>

                    <ListingInfo>
                        <Icon name={'home'} type={'ionicon'} size={10} color={'white'}/>
                        <TextComponent tiny color={'white'} multiline={true}>  {IncludeListing.address}, {IncludeListing.location.city}</TextComponent>
                    </ListingInfo>

                </ModalHeader>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{paddingHorizontal: 10, paddingVertical: 10}}>
                        { message.messages.map((eachMessage, key= 0) =>
                            <View key={key}>
                                <View  style={{flexDirection: 'row', alignItems: "center", alignSelf: currentUserId === eachMessage?.senderId ? 'flex-end' : 'flex-start'}}>

                                    { currentUserId !== eachMessage.senderId ? <Avatar.Image size={35} source={{uri: ToUserInfo.profilePhotoUrl}} style={{ marginRight: 10}}/> : null

                                    }
                                    <View style={[{backgroundColor: currentUserId !== eachMessage?.senderId ? 'cyan' : '#8eabf2',
                                        marginVertical: 5,
                                        paddingHorizontal: 10, paddingVertical: 10, maxWidth: '75%'}, currentUserId === eachMessage?.senderId ? styles.rightAlignMessage : styles.leftAlignMessage]}>
                                        {ChatBubble(eachMessage.message)}
                                    </View>
                                </View>
                                {ChatSentTime(eachMessage.sentAt.seconds, eachMessage?.senderId)}
                            </View>)
                        }
                    </View>
                </ScrollView>
                <MessageSendMainContainer>
                        <SendMessageBox placeholder={'Send your Message'} placeholderTextColor={'grey'} multiline={true}
                                        defaultValue={sendMessage}
                                        onChangeText={(text) => setSendMessage(text)}
                        />
                        <Icon reverse name={'send'} type={'md'} size={15} style={{marginLeft: 5}} color={sendMessage.trim() ==='' ? 'grey' : '#8eabf2'} onPress={() => SendMessage(message.id)}
                              disabled={sendMessage.trim() === ''}/>

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
width: 88%;
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
