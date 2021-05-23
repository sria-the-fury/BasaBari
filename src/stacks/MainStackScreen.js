import React, {useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Badge, Icon} from "react-native-elements";
import {Text, TouchableOpacity, View} from "react-native";
import _ from 'lodash';
import HomeScreen from "../screens/HomeScreen";
import FavoriteListingsScreen from "../screens/FavoriteListingsScreen";
import AddListingScreen from "../screens/AddListingScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import {FirebaseContext} from "../context/FirebaseContext";
import { Avatar } from 'react-native-paper';
import {Colors} from "../components/utilities/Colors";
import firestore from "@react-native-firebase/firestore";
import {UserContext} from "../context/UserContext";
import MyListingScreen from "../screens/MyListingsScreen";
import {TextComponent} from "../components/TextComponent";
import PushNotification from "react-native-push-notification";


export default function MainStackScreen() {
    const firebase = useContext(FirebaseContext)
    const [user] = useContext(UserContext);
    const MainStack = createBottomTabNavigator();

    const currentUserInfo = firebase.getCurrentUser();
    const [notifications, setNotifications] = useState(null);
    useEffect(() => {

        const subscriber = firestore().collection('notifications')
            .where('type', '==', 'message')
            .where('notifyTo', '==', currentUserInfo.uid).where('read', '==', false).onSnapshot(
                docs=> {
                    let data=[];
                    if(docs) {
                        docs.forEach(doc => {
                            const {notifyTo, notifyFrom, read, notifyAt, content, listingId} = doc.data();
                            data.push({
                                id: doc.id, notifyTo, read, notifyAt, listingId, notifyFrom, content
                            });
                        });
                        setNotifications(data);
                    }

                });

        return () => subscriber();


    }, []);


    if(notifications?.length > 0) {
        PushNotification.removeAllDeliveredNotifications();
        PushNotification.createChannel(
            {
                channelId: currentUserInfo.uid, // (required)
                channelName: `Basa Bari's Notification`, // (required)
                // channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
                playSound: true, // (optional) default: true
                soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
                vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
            },
            (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
        );
        _.each(notifications, async (notification) => {
            if(!notification.read){
                const notifiedFrom = await firebase.getUserInfo(notification.notifyFrom);
                const listingName = await firebase.getListingName(notification.listingId);
                if(notifiedFrom) PushNotification.getChannels(function (channel_ids) {
                    PushNotification.localNotification({
                        //... You can use all the options from localNotifications
                        channelId: channel_ids[0],
                        title: notifiedFrom.userName,
                        message: notification.content, // (required)
                        vibrate: true, // (optional) default: true
                        largeIconUrl: notifiedFrom.profilePhotoUrl,
                        // bigPictureUrl: profileUserInfo.photoURL,
                        bigText: notification.content,
                        subText: `Message @ ${listingName}`,
                        vibration: 300,
                        // actions: ["ReplyInput"],
                        // reply_placeholder_text: "Write your response...", // (required)
                        // reply_button_text: "Reply", // (required)
                        playSound: true,
                        soundName: "default",
                        when: notification.notifyAt,
                        visibility: "public", // (optional) set notification visibility, default: private
                        badge: true,
                        isSilent: false,
                        ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear). should be used in combine with `com.dieam.reactnativepushnotification.notification_foreground` setting
                        // allowWhileIdle: false, // (optional) set notification to work while on doze, default: false
                    });
                });
            }
        })

    };


    const tabBarOptions = {
        showLabel: false,
        style: {
            backgroundColor: Colors.primaryBody,
            paddingBottom: 5,
            paddingTop:5,
            height: 54
        }

    };



    const screenOptions = ({route}) => ({
        tabBarIcon: ({focused}) => {
            let iconName;

            switch (route.name) {
                case 'Home':
                    iconName = 'home';
                    break;

                case 'Messages':
                    iconName = 'chatbubble-ellipses';
                    break;

                case 'Profile':
                    iconName = 'person-circle';
                    break;
                default:
                    iconName = 'home';


            }
            if(route.name === 'Listing' ) {
                return (
                    <View style={{alignItems: 'center', justifyContent: 'center',
                        height: 46, width: 46, borderRadius:23, borderColor: 'white', borderWidth: 3
                    }}>
                        <Icon name={'house'} size={40} color={Colors.appIconColor} type='md' style={{shadowColor: 'black', shadowOffset: {width: 0, height: 10}, shadowRadius: 5,
                            shadowOpacity: 0.3, elevation: 10}}/>
                        <View style={{position: 'absolute', top: -6, left: -8,
                            padding: 2,
                            backgroundColor: Colors.primaryBody, height: 22, width: 22, borderRadius: 12,
                            alignItems: 'center', flex: 1, justifyContent: 'center', borderColor: 'white', borderWidth: 2}}>
                            <Icon name={'add'} type={'md'} color={'white'} size={14}/>
                        </View>

                    </View>
                );
            }

            if(route.name === 'MyListings'){
                return (
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <TextComponent color={focused ? 'white' :'#666666'} extraTiny>My</TextComponent>
                        <Icon name={'roofing'} size={30} color={focused ? 'white' :'#666666' } type='md'
                              style={{shadowColor: 'black', shadowOffset: {width: 0, height: 10}, shadowRadius: 5,
                            shadowOpacity: 0.3, elevation: 10}}/>
                    </View>
                )
            }

            if(route.name === 'Profile'){
                return(
                    currentUserInfo?.photoURL ?
                        <Avatar.Image size={30} source={{uri: currentUserInfo.photoURL}}/>
                        :
                        <Icon name={'person-circle'} type='ionicon' size={30} color={focused ? '#5d00ff' :'#666666' }/>
                )
            }

            if(route.name === 'Messages'){
                return (
                    <View>
                        <Icon name={'chatbubble-ellipses'} type='ionicon' size={30} color={focused ? 'white' :'#666666'}/>
                        {notifications?.length > 0 ?
                            <Badge status={'error'} containerStyle={{position: 'absolute', right: -10, top: -5,borderColor: Colors.primaryBody, borderWidth: 2, borderRadius:50}}
                                   value={<Text style={{color:'white', fontSize: 10}}>{notifications.length}</Text>} /> : null}
                    </View>
                )
            }

            if(route.name === 'Favorite'){
                return (
                    <Icon name={'heart'} size={30} type='ionicon' color={focused ? '#b716af' : '#666666'}/>
                );

            }

            return <Icon name={iconName} type='ionicon' size={30} color={focused ? 'white' :'#666666' }/>;

        },



    });

    return (
        <MainStack.Navigator tabBarOptions={tabBarOptions} screenOptions={screenOptions} >
            <MainStack.Screen name={'Home'} component={HomeScreen}/>
            {
                user.userType === 'tenant' ?
                <MainStack.Screen name={'Favorite'} component={FavoriteListingsScreen}/> : null
            }
            <MainStack.Screen name={'Messages'} component={MessagesScreen}/>

            { user.userType === 'landlord' ?

                <MainStack.Screen name={'Listing'} component={AddListingScreen}
                                  listeners={({navigation}) => ({
                                      tabPress: event => {
                                          event.preventDefault();
                                          navigation.navigate("AddListing");

                                      }
                                  })}
                /> : null }

            {
                user.userType === 'landlord' ?
                <MainStack.Screen name={'MyListings'} component={MyListingScreen}/> : null

            }
            <MainStack.Screen name={'Profile'} component={ProfileScreen}
                              listeners={({navigation}) => ({
                                  tabPress: event => {
                                      event.preventDefault();
                                      navigation.navigate("ProfileScreen");

                                  }
                              })}/>

        </MainStack.Navigator>

    )
}





