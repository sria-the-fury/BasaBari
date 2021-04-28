import React,{useContext} from 'react';
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Icon} from "react-native-elements";
import { Text, View} from "react-native";

import HomeScreen from "../screens/HomeScreen";
import FavoriteListingsScreen from "../screens/FavoriteListingsScreen";
import AddListingScreen from "../screens/AddListingScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import {FirebaseContext} from "../context/FirebaseContext";
import { Avatar } from 'react-native-paper';


export default function MainStackScreen() {
    const firebase = useContext(FirebaseContext)
    const MainStack = createBottomTabNavigator();

    const getCurrentUserProfileUrl = firebase.getCurrentUser().photoURL;

    const tabBarOptions = {
        showLabel: false,
        style: {
            backgroundColor: '#320A28',
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
            if(route.name === 'Listing') {
                return (
                    <View style={{alignSelf:'center', alignItems: 'center', justifyContent: 'center', backgroundColor: 'red',
                        height: 46, width: 46, borderRadius:23, borderColor: 'white', borderWidth: 3
                    }}>
                        <Text><Icon name={'add'} size={40} color={'white'} type='md' style={{shadowColor: 'black', shadowOffset: {width: 0, height: 10}, shadowRadius: 5,
                            shadowOpacity: 0.3, elevation: 10}}/></Text>

                    </View>
                );
            }

            if(route.name === 'Profile'){
                return(
                    getCurrentUserProfileUrl ?
                        <Avatar.Image size={30} source={{uri: getCurrentUserProfileUrl}}/>
                        :
                        <Icon name={'person-circle'} type='ionicon' size={30} color={focused ? '#5d00ff' :'#666666' }/>
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
            <MainStack.Screen name={'Favorite'} component={FavoriteListingsScreen}/>
            <MainStack.Screen name={'Listing'} component={AddListingScreen}
                              listeners={({navigation}) => ({
                                  tabPress: event => {
                                      event.preventDefault();
                                      navigation.navigate("AddListing");

                                  }
                              })}
            />
            <MainStack.Screen name={'Messages'} component={MessagesScreen}
                              listeners={({navigation}) => ({
                                  tabPress: event => {
                                      event.preventDefault();
                                      navigation.navigate("MessagesScreen");
                                  }
                              })}
            />
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





