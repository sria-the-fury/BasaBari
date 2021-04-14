
import React, {useState, useEffect, useContext} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView, TouchableOpacity, Pressable,
} from 'react-native';
import {TextComponent} from "../components/TextComponent";
import styled from "styled-components";
import {Colors} from "../components/utilities/Colors";
import {Icon} from "react-native-elements";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import firestore from "@react-native-firebase/firestore";
import _ from "lodash";
import {FirebaseContext} from "../context/FirebaseContext";
import {Avatar} from "react-native-paper";
import {TermsAndConditionsModal} from "../modals/TermsAndConditionsModal";
import {ChatModal} from "../modals/ChatModal";
import {Messages} from "../components/messages/Messages";




export default function NotificationScreen(props) {

    const [messages, setMessages] = useState(null);
    const [sendUsersInfo, setSendUsersInfo] = useState(null);
    const [ListingsData, setListingsData] = useState(null);
    const [users, setUsers] = useState(null);
    const firebase = useContext(FirebaseContext);

    const currentUserId = firebase.getCurrentUser().uid;

    useEffect(() => {

        const subscriber = firestore().collection('messages').orderBy('createdAt', 'desc').onSnapshot(
            docs=> {
                let allMessages = [];
                if(docs) {
                   docs.forEach((doc) => {

                       let {listingOwnerId, senderId, listingId, sharedImages, messages} = doc.data();
                       allMessages.push({
                           id: doc.id,listingOwnerId,senderId, listingId, sharedImages, messages
                       })
                   });

                    setMessages(allMessages);
                }


            });

        const listingSubscriber = firestore().collection('users').onSnapshot(
            docs=> {
                let data=[];
                if(docs) {
                    docs.forEach(doc => {
                        data.push({
                            id: doc.id,
                            userName: doc.data().userName,
                            profilePhotoUrl: doc.data().profilePhotoUrl,
                            phoneNumber: doc.data().phoneNumber

                        });

                    });
                    setUsers(data);
                }


            });

        const usersSubscriber = firestore().collection('listings').onSnapshot(
            docs=> {
                let data=[];
                if(docs) {
                    docs.forEach(doc => {
                        data.push({
                            id: doc.id,
                            listingId: doc.data().listingId,
                            address: doc.data().address,
                            userId: doc.data().userId,
                            location: doc.data().location
                        });

                    });
                    setListingsData(data);
                }


            });

        return () => subscriber();


    }, []);

    const filterMessageByCurrentUser = messages ? _.filter(messages, (message) => {
        return (message.listingOwnerId === currentUserId || message.senderId === currentUserId);
    }): null;

    const findListingData = filterMessageByCurrentUser && ListingsData ? _.find(ListingsData, (listing) => {
        return _.find(filterMessageByCurrentUser, {listingId : listing.listingId})
    }) : null;

    const findOwner = filterMessageByCurrentUser && users ? _.filter(users, (user) => {
        return (_.find(filterMessageByCurrentUser, {listingOwnerId : user.id}))
    }) : null;

    const findOtherUser = filterMessageByCurrentUser && users ? _.filter(users, (user) => {
        return (_.find(filterMessageByCurrentUser, {senderId : user.id}))
    }) : null;




    const [openChatModal, setChatModal] = useState(false);

    const UserInfoAndListingInfo = (listingId, sendUserId, listingOwnerId, messages) => {
        const findListingData = ListingsData ? _.find(ListingsData, {listingId : listingId}) : null;
        const UserInfo = users && currentUserId !== sendUserId ? _.find(users, {id : sendUserId}) : users && currentUserId !== listingOwnerId ? _.find(users, {id : listingOwnerId}) : null;

        if(findListingData && UserInfo){
            return(
                <View style={{flexDirection: 'row', paddingHorizontal: 10, alignItems: 'center'}}>
                    <Avatar.Image size={50} source={{uri: UserInfo.profilePhotoUrl}}/>
                    <View style={{marginLeft: 10}}>
                        <TextComponent bold semiLarge>{UserInfo.userName}</TextComponent>
                        <View style={{flexDirection: "row", alignItems: "center"}}>
                            <Icon name={'mode-comment'} type={'md'} size={15} color={'grey'} style={{marginRight: 5}}/>
                            {messages[0].senderId === currentUserId ? <TextComponent bold > Me : </TextComponent> : null }
                            <TextComponent bold >{messages[0].message}</TextComponent>
                        </View>
                        <View style={{flexDirection: "row", alignItems: "center"}}>
                            <Icon name={'home'} type={'ionicon'} size={15} color={'grey'} style={{marginRight: 5}}/>
                            <TextComponent color={'grey'}>{findListingData.address}</TextComponent>
                        </View>
                    </View>

                </View>
            )
        }

    };

    const [toUserInfo, setToUserInfo] = useState(null);
    const [includeListing, setIncludeListing] = useState(null);

    const messageActions = (listingId, sendUserId, listingOwnerId) => {
        const findListingData = ListingsData ? _.find(ListingsData, {listingId : listingId}) : null;
        const UserInfo = users && currentUserId !== sendUserId ? _.find(users, {id : sendUserId}) : users && currentUserId !== listingOwnerId ? _.find(users, {id : listingOwnerId}) : null;
        if(findListingData && UserInfo) {
            setToUserInfo({
                userName: UserInfo.userName,
                profileImage: UserInfo.profilePhotoUrl,
                phoneNumber: UserInfo.phoneNumber

            });

            setIncludeListing({
                address: findListingData.address,
                location: findListingData.location
            });

            setChatModal(true);


        }
    };



    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryBody}/>
            <Header>
                <Icon name={'chevron-back-outline'} type={'ionicon'} size={35} color={'white'} onPress={() => props.navigation.goBack()}/>
                <TextComponent color={'white'} semiLarge>Messages</TextComponent>

            </Header>
            <ScrollView showsVerticalScrollIndicator={false}>
                {
                     users && ListingsData && filterMessageByCurrentUser && filterMessageByCurrentUser.map(message =>
                        <Messages key={message.id} message={message} users={users} listingData={ListingsData}>
                            {UserInfoAndListingInfo(message.listingId, message.senderId, message.listingOwnerId, message.messages)}
                            {/*<ChatModal modalVisible={openChatModal} modalHide={setChatModal} message={message} ToUserInfo={toUserInfo} IncludeListing={includeListing}/>*/}
                        </Messages>

                    )
                }
            </ScrollView>

        </Container>

    )
}

const Container = styled.SafeAreaView`
flex: 1;
`;

const Header = styled.View`
backgroundColor: ${Colors.primaryBody}
flexDirection: row;
alignItems: center;
justifyContent: space-between
paddingHorizontal: 20px;
paddingVertical: 10px;
`

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    fadingContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "powderblue"
    },
    fadingText: {
        fontSize: 28,
        textAlign: "center",
        margin: 10
    },
    buttonRow: {
        flexDirection: "row",
        marginVertical: 16
    }
});



