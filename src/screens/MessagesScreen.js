
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
import {Badge, Icon, ListItem} from "react-native-elements";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import firestore from "@react-native-firebase/firestore";
import _ from "lodash";
import {FirebaseContext} from "../context/FirebaseContext";
import {Avatar} from "react-native-paper";
import {Messages} from "../components/messages/Messages";
import moment from "moment";




export default function MessagesScreen(props) {

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

    const UserInfoAndListingInfo = (listingId, sendUserId, listingOwnerId, messages) => {
        const findListingData = ListingsData ? _.find(ListingsData, {listingId : listingId}) : null;
        const UserInfo = users && currentUserId !== sendUserId ? _.find(users, {id : sendUserId}) : users && currentUserId !== listingOwnerId ? _.find(users, {id : listingOwnerId}) : null;
        const lastMessage = messages.length > 0 ? messages[messages.length-1] : messages[0];
        const unreadMessage = _.filter(messages, {read: false});

        if(findListingData && UserInfo){
            return(
                <ListItem bottomDivider>
                    <Avatar.Image size={60} source={{uri: UserInfo.profilePhotoUrl}}/>
                    <ListItem.Content>
                        <View style={{flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', width: '100%'}}>
                            <TextComponent bold semiLarge>{UserInfo.userName}</TextComponent>
                            <TextComponent tiny color={'grey'} >{sentAtTime(lastMessage.sentAt.seconds)}</TextComponent>
                        </View>

                        <View style={{flexDirection: "row", alignItems: "center"}}>
                            <Icon name={'mode-comment'} type={'md'} size={15} color={lastMessage.senderId !== currentUserId && !lastMessage.read ? '#3188D9':'grey'} style={{marginRight: 5}}/>
                            {lastMessage.senderId === currentUserId ? <TextComponent bold > Me : </TextComponent> : null }
                            <TextComponent medium numberOfLines={1} color={lastMessage.senderId !== currentUserId && !lastMessage.read ? '#3188D9' : 'grey'}>{lastMessage.message}</TextComponent>
                            { lastMessage.senderId !== currentUserId && !lastMessage.read ?
                                <Badge containerStyle={{marginLeft: 10}}
                                       value={<Text style={{color:'white', fontSize: 10}}>{unreadMessage.length}</Text>} /> : null
                            }
                        </View>
                        <View style={{flexDirection: "row", alignItems: "center"}}>
                            <Icon name={'home'} type={'ionicon'} size={15} color={'grey'} style={{marginRight: 5}}/>
                            <TextComponent color={'grey'}>{findListingData.address}, {findListingData.location.city}</TextComponent>
                        </View>


                    </ListItem.Content>

                </ListItem>
            )
        }

    };


    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryBody}/>
            <Header>
                <Icon name={'chevron-back-outline'} type={'ionicon'} size={35} color={'white'} onPress={() => props.navigation.goBack()}/>
                <TextComponent color={'white'} semiLarge>Messages</TextComponent>

            </Header>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={'always'}>
                {
                    users && ListingsData && filterMessageByCurrentUser && filterMessageByCurrentUser.map(message =>
                        <Messages key={message.id} message={message} users={users} listingData={ListingsData}>
                            {UserInfoAndListingInfo(message.listingId, message.senderId, message.listingOwnerId, message.messages)}

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


