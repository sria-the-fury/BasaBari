import React, {useContext, useEffect, useRef, useState} from 'react';
import styled from "styled-components";
import {
    ActivityIndicator,
    Linking,
    StyleSheet, Switch,
    ToastAndroid,
    TouchableHighlight,
    TouchableOpacity,
    View
} from 'react-native';
import {TextComponent} from "../components/TextComponent";
import {Divider, Icon} from "react-native-elements";
import {TermsAndConditionsModal} from "../modals/TermsAndConditionsModal";
import {UserContext} from "../context/UserContext";
import {FirebaseContext} from "../context/FirebaseContext";
import ImagePicker from "react-native-customized-image-picker";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";
import RBSheet from "react-native-raw-bottom-sheet";
import {Avatar, Colors as RNPColors, TextInput} from "react-native-paper";
import PushNotification from "react-native-push-notification";
import firestore from "@react-native-firebase/firestore";


export default function ProfileScreen(props) {

    const [profileImageLoading, setProfileImageLoading] = useState(false);
    const [nameLoading, setNameLoading] = useState(false);
    const [updatedName, setUpdateName] = useState('');
    const [userInfoFromDB, setUserInfo] = useState(null);


    // userContext
    const [user] = useContext(UserContext);
    const[_,setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);
    const profileUserInfo = firebase.getCurrentUser() ? firebase.getCurrentUser() : '';


    useEffect(() => {
        const findOneUser = firestore().collection('users').doc(profileUserInfo?.uid).onSnapshot(
            doc=> {
                if(doc) {
                    setUserInfo(doc.data());
                    setOnlineStatus(doc.data().usersSettings.onlineStatus);
                }
            });

        return () => findOneUser();

    }, []);

    //openModal
    const [openTermsModal, setTermsModal] = useState(false);


    //useStateFor inLineEdit
    const[isEditable, setEditable] = useState(false);

    const editName = () => {
        setEditable(true);

    }

    const cancelUpdateName = () => {
        setEditable(false);
        setUpdateName('');

    }


//functions for closing Modals
    const closeTermsModal = () => {
        setTermsModal(false);
    }

    //log out
    const loggedOut = async () => {
        PushNotification.deleteChannel(profileUserInfo?.uid);
        const loggedOut = await firebase.loggedOut();

        if(loggedOut) setUser({isLoggedIn: null, userType: null});
    }


    //updating functions

    const updateUserName = async () =>{
        setNameLoading(true);

        try{
            const newName = updatedName.trim();
            await firebase.updateUserProfileName(newName);

        }catch (e) {
            ToastAndroid.show(e.message , ToastAndroid.LONG);
            setNameLoading(false);
            alert(e.message);

        }
        finally {
            ToastAndroid.show('Name updated', ToastAndroid.SHORT);

            setNameLoading(false);
            cancelUpdateName();
            UpdateNameBottomSheet.current.close();

        }
    };

    const updatePhoneNumber = async  () => {
        setPhoneLoading(true);

        try{
            await firebase.updateProfilePhoneNumber(updatedPhone)
        } catch (e) {
            alert(e.message);

        } finally {

            setPhoneLoading(false);
            cancelUpdatePhone();

        }

    }


    const uploadUpdateProfileImage = async (path) => {
        try {
            setProfileImageLoading(true);
            await firebase.uploadProfilePhoto(path);
            setUser( {
                ...user,
                profilePhotoUrl: profileUserInfo.photoURL
            });


        } catch (e) {
            alert(e.message);
        } finally {
            setProfileImageLoading(false);
            removeTempImages();
            PhotoChangeBottomSheet.current.close();
            ToastAndroid.show('Display Image Changed', ToastAndroid.SHORT);
        }
    }
    const chooseProfileImage = () => {
        removeTempImages();
        ImagePicker.openPicker({
            width: 800,
            height: 800,
            compressQuality: 80,
            minCompressSize: 120,
            cropping: true,
            imageLoader: 'UNIVERSAL'
        }).then(image => {
            if(image.length){
                uploadUpdateProfileImage(image[0].path).then(() => {
                    setProfileImageLoading(false);
                })
            }

        });

    };

    const removeTempImages = () => {
        ImagePicker.clean()
            .then(() => {

            })
            .catch(e => {
                console.log(e);
            });

    };


    const mailTo = async () => {
        await Linking.openURL('mailto: basabari@oasisoneric.tech');
    };

    const UpdateNameBottomSheet = useRef();
    const PhotoChangeBottomSheet = useRef();

    const disableUpdateNameButton = () => {
        return (updatedName.trim() === profileUserInfo.displayName || updatedName === '' || updatedName.length < 3);

    };

    const [isNotificationStop, setNotification] = useState(false);


    const [isShowOnline, setOnlineStatus] = useState(userInfoFromDB?.usersSettings.onlineStatus);

    const changeOnlineStatus = async () => {

        if(isShowOnline){
            await firebase.userOnlineStatus(profileUserInfo?.uid, false);
            await firebase.userSettingsUpdate(profileUserInfo?.uid, false, 'ONLINE_STATUS');
            setOnlineStatus(false);
        }
        if(!isShowOnline){
            await firebase.userOnlineStatus(profileUserInfo?.uid, true);
            await firebase.userSettingsUpdate(profileUserInfo?.uid, true, 'ONLINE_STATUS');
            setOnlineStatus(true);
        }
    }

    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryStatusbarColor}/>

            <Header>
                <View style={{alignItems: 'center',
                    flexDirection: 'row', paddingHorizontal: 10}}>
                    <VerticalLine/>
                    <Icon name={'chevron-back-circle'} type={'ionicon'} style={{shadowColor: 'black', elevation: 5}}
                          size={40} color={Colors.primaryBody} onPress={() => props.navigation.goBack()}/>
                </View>

                <NameImageAndPhone>
                    <View>
                        <Avatar.Image size={60} source={{uri: profileUserInfo?.photoURL}}/>
                        { isShowOnline ? <View style={{position: 'absolute', top: 2, right: 2, backgroundColor: Colors.primaryBody,
                            borderColor: Colors.primaryBody, borderRadius: 6, borderWidth: 2, height: 12, width: 12}}>

                            <View style={{backgroundColor: Colors.onlineStatusDotColor, height: 8, width: 8, borderRadius: 4}}/>
                        </View> : null }

                    </View>

                    <View style={{marginLeft: 10}}>
                        <TextComponent medium bold color={'white'}>{profileUserInfo?.displayName}</TextComponent>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Icon name={'phone'} type={'md'} color={'white'} size={15}/>
                            <TextComponent color={'white'}>{profileUserInfo?.phoneNumber}</TextComponent>
                        </View>
                    </View>
                </NameImageAndPhone>
            </Header>

            <ScrollViewContainer>

                <UserTopSettings>
                    <TouchableHighlightContainer
                        onPress={() => {
                            UpdateNameBottomSheet.current.open()}}  activeOpacity={0.6}
                        underlayColor="#DDDDDD">
                        <TouchContainer>
                            <IconAndTextContainer>
                                <Icon name={'person'} type={'md'} size={15} style={{marginRight: 10}}/>
                                <TextComponent>Change Display Name</TextComponent>
                            </IconAndTextContainer>

                            <Icon name={'edit'} type={'md'} size={15}/>

                        </TouchContainer>
                    </TouchableHighlightContainer>

                    <Divider/>

                    <TouchableHighlightContainer
                        onPress={() => {
                            PhotoChangeBottomSheet.current.open()}}  activeOpacity={0.6}
                        underlayColor="#DDDDDD">
                        <TouchContainer>
                            <IconAndTextContainer>
                                <Icon name={'portrait'} type={'md'} size={15} style={{marginRight: 10}}/>
                                <TextComponent>Change Display Photo</TextComponent>
                            </IconAndTextContainer>

                            <Icon name={'add-photo-alternate'} type={'md'} size={15}/>

                        </TouchContainer>
                    </TouchableHighlightContainer>

                    <Divider/>

                    <TouchContainer>

                        <IconAndTextContainer>
                            <View style={{backgroundColor: Colors.primaryBody, padding: 3, borderRadius: 3, marginRight: 10}}>
                                <TextComponent extraTiny color={'white'}>EN</TextComponent>
                            </View>

                            <TextComponent>Change Language</TextComponent>
                        </IconAndTextContainer>
                        <View style={{backgroundColor: 'grey', padding: 3, borderRadius: 3}}>

                            <TextComponent tiny color={'white'}>বাংলা</TextComponent>
                        </View>

                    </TouchContainer>

                    <Divider/>

                    <TouchableHighlightContainer onPress={() => mailTo()}  activeOpacity={0.6}
                                                 underlayColor="#DDDDDD">
                        <TouchContainer>
                            <IconAndTextContainer>
                                <Icon name={'feedback'} type={'md'} size={15} style={{marginRight: 10}}/>
                                <TextComponent>Give Feedback</TextComponent>
                            </IconAndTextContainer>

                            <Icon name={'email'} type={'md'} size={15}/>

                        </TouchContainer>
                    </TouchableHighlightContainer>

                    <Divider/>

                    <TouchableHighlightContainer
                        activeOpacity={0.6}
                        underlayColor="#DDDDDD"
                        onPress={() => setTermsModal(true)}>

                        <TouchContainer>
                            <IconAndTextContainer>
                                <Icon name={'article'} type={'material'} size={15} style={{marginRight: 10}}/>
                                <TextComponent>Terms & Conditions</TextComponent>
                            </IconAndTextContainer>

                        </TouchContainer>
                    </TouchableHighlightContainer>

                    <Divider/>

                    <TouchableHighlightContainer>

                        <TouchContainer>
                            <IconAndTextContainer>
                                <Icon name={'person-remove-outline'} type={'ionicon'} color={'red'}
                                      size={15} style={{marginRight: 10}}/>
                                <TextComponent color={'red'}>Delete Your Account!</TextComponent>
                            </IconAndTextContainer>

                        </TouchContainer>
                    </TouchableHighlightContainer>

                </UserTopSettings>


                <UserBottomSettings>
                    <View style={{flexDirection: 'row'}}>
                        <Icon name={'cog-outline'} type={'ionicon'} size={18} style={{marginRight: 10}}/>
                        <TextComponent bold medium>Settings</TextComponent>
                    </View>

                    <TouchableHighlight style={{paddingHorizontal: 20}}>
                        <View style={{flexDirection: 'row',
                            paddingVertical: 10,
                            alignItems: 'center', justifyContent : 'space-between'}}>
                            <View style={{flexDirection: 'row',
                                alignItems: 'center'}}>
                                <Icon name={isNotificationStop ? 'notifications-off':'notifications'} type={'ionicon'} size={15} style={{marginRight: 10}}/>
                                <TextComponent color={'black'}>{isNotificationStop ? 'Stop Notification' : 'Get Notification'}</TextComponent>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: '#767577' }}
                                thumbColor={isNotificationStop ? "#81b0ff" : "#f4f3f4"}
                                onValueChange={() =>  setNotification(!isNotificationStop)}
                                value={isNotificationStop}
                            />

                        </View>

                    </TouchableHighlight>

                    <Divider/>

                    <TouchableHighlight style={{paddingHorizontal: 20}}>
                        <View style={{flexDirection: 'row',
                            paddingVertical: 10,
                            alignItems: 'center', justifyContent : 'space-between'}}>
                            <View style={{flexDirection: 'row',
                                alignItems: 'center'}}>
                                <Icon name={'ellipse'} type={'ionicon'} size={15} style={{marginRight: 10}} color={!isShowOnline ? Colors.onlineStatusDotColor : 'grey'}/>
                                <TextComponent color={'black'}>{isShowOnline ? 'Hide online status' : 'Show online status'}</TextComponent>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: '#767577' }}
                                thumbColor={isShowOnline ? Colors.onlineStatusDotColor : "#f4f3f4"}
                                onValueChange={() =>  changeOnlineStatus()}
                                value={isShowOnline}/>

                        </View>
                    </TouchableHighlight>
                </UserBottomSettings>

            </ScrollViewContainer>

            <LogOut onPress={() => loggedOut()}>
                <Icon reverse name={'logout'} type={'md'} size={25} color={Colors.primaryBody}/>
            </LogOut>

            <RBSheet
                ref={UpdateNameBottomSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                dragFromTopOnly={true}
                height={130}

                customStyles={{
                    wrapper: {
                        backgroundColor: "transparent"
                    },
                    container: style.sheetContainer,

                }}
            >
                <TextInput style={{
                    backgroundColor: Colors.primaryBody,
                    fontSize: 20,
                    marginTop: 25,
                    paddingHorizontal: 10
                }}
                           mode={'outlined'}
                           label="Your Name"
                           placeholder={profileUserInfo?.displayName}
                           placeholderTextColor={'grey'}
                           defaultValue={profileUserInfo.displayName}
                           autoCompleteType={'name'} maxLength={23} autoCapitalize={'words'}
                           onChangeText={(updatedName) => setUpdateName(updatedName)}
                           theme={{
                               colors: {
                                   placeholder: 'lavender',
                                   text: 'lavender',
                                   primary: 'lavender',
                                   underlineColor: 'transparent'
                               }
                           }}

                           onBlur={() => setUpdateName('')}
                           right={
                               nameLoading ?
                                   <TextInput.Icon name={() =>
                                       <ActivityIndicator color={'white'} size={'large'}/>

                                   }/>


                                   : <TextInput.Icon name={() =>

                                       <Icon raised reverse name={'cloud-upload-outline'} type={'ionicon'} size={15}
                                             color={disableUpdateNameButton() ? 'grey' : 'green'}
                                             onPress={() => updateUserName()}
                                             disabled={disableUpdateNameButton()}/>

                                   }/>
                           }

                           left={
                               <TextInput.Icon
                                   name={() =>

                                       <Avatar.Image size={30} source={{uri: profileUserInfo.photoURL}}/>
                                   }
                               />
                           }
                />

                <UpdateNameButton disabled={disableUpdateNameButton()}>
                    <Icon name={'edit'} type={'material'} size={15} color={profileIconsColor}
                          style={{marginRight: 3}}/>
                    <TextComponent color={'white'} bold>UPDATE NAME</TextComponent>
                </UpdateNameButton>


            </RBSheet>

            <RBSheet
                ref={PhotoChangeBottomSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                dragFromTopOnly={true}

                customStyles={{
                    wrapper: {
                        backgroundColor: "transparent"
                    },
                    container: style.displayNameBottomSheet,

                }}
            >
                <View style={{marginVertical: 10, alignItems: "center", justifyContent: 'center', flex: 1}}>

                    <ProfileImageContainer>

                        <ProfileImage source={profileUserInfo.photoURL ? {uri : profileUserInfo.photoURL} : require('../../assets/default-profile-image.png')}/>
                        <TouchableOpacity style={[{position: "absolute"}, profileImageLoading ? {alignSelf: 'center'} : {top: 4, left:10}]}
                                          onPress={() => chooseProfileImage()} disabled={profileImageLoading}>
                            { profileImageLoading ? <Loading/> :

                                <Icon name={'edit'} type={'md'} size={24} color={Colors.primaryBody} style={{backgroundColor: Colors.appIconColor,
                                    borderRadius:50, padding:2, borderColor: 'white', borderWidth: 3}}/>
                            }
                        </TouchableOpacity>
                    </ProfileImageContainer>

                </View>
                <ChangeDisplayImageBTN>
                    <Icon name={'portrait'} type={'material'} size={15} color={profileIconsColor}
                          style={{marginRight: 3}}/>
                    <TextComponent color={'white'} bold >UPDATE DISPLAY PHOTO</TextComponent>
                </ChangeDisplayImageBTN>
            </RBSheet>


            <TermsAndConditionsModal modalVisible={openTermsModal} modalHide={closeTermsModal}/>

        </Container>
    )
}


const profileIconsColor = 'white';

const Container = styled.SafeAreaView`
flex:1;
backgroundColor: white;
`;

const Header = styled.View`
flexDirection: row;
alignItems: center;
justifyContent: space-between;
`;

const VerticalLine = styled.View`
height: 25px;
width: 5px;;
backgroundColor: ${Colors.primaryBody};
position: absolute; 
top: -15px;
left: 70%;
shadowColor: black;
elevation: 5;
                 
`

const NameImageAndPhone = styled.View`
backgroundColor: ${Colors.primaryBody};
                    paddingHorizontal:12px
                    paddingVertical: 5px;
                    flexDirection: row;
                    alignItems: center;
                     alignSelf: flex-end;
                    borderBottomLeftRadius: 25px;

`;

const UserTopSettings = styled.View`
marginVertical: 20px;
 backgroundColor: white;
  shadowColor: black;
   elevation: 2;
   paddingHorizontal:12px;
    paddingVertical: 5px;
    borderRadius: 10px;
     marginHorizontal: 25px;
`;

const UserBottomSettings = styled.View`
paddingHorizontal: 10px;
 backgroundColor: white;
 shadowColor: black;
 elevation: 2;
 paddingVertical: 10px
`;

const LogOut = styled.TouchableHighlight`
position: absolute;
 bottom: 0;
  left: -10px;
backgroundColor: ${Colors.primaryBody};
borderTopRightRadius: 50px;
`


const ProfileImageContainer = styled.View`
height:170px;
width:170px;
backgroundColor: white;
alignItems: center;
justifyContent:center;
borderRadius:85px;
alignSelf: center;
elevation: 10;
shadowColor: #000;
 shadowOpacity: 1;
shadowRadius: 5.32px;
`;

const ProfileImage = styled.Image`
height:160px;
width:160px;
borderRadius: 80px;

`;


const OpenBottomSheetButton = styled.Pressable`
flexDirection : row;
alignItems: center;
marginTop: 10px;
alignSelf: flex-end;
backgroundColor: ${RNPColors.green400}
paddingHorizontal: 5px;
paddingVertical: 5px;
borderRadius: 30px;
`;

const UpdateNameButton = styled.View`
flexDirection : row;
alignItems: center;
backgroundColor: ${Colors.primaryBodyLight}
paddingHorizontal: 10px;
paddingVertical: 10px;
position: absolute;

alignSelf: center;
borderRadius: 5px;
`;

const ChangeDisplayImageBTN = styled.View`
flexDirection : row;
alignItems: center;
backgroundColor: ${Colors.primaryBodyLight}
paddingHorizontal: 10px;
paddingVertical: 10px;
position: absolute;

alignSelf: center;
borderRadius: 20px;
`;


const ScrollViewContainer = styled.ScrollView`
backgroundColor: white;
width:100%;
overflow:hidden;
`;

const TouchableHighlightContainer = styled.TouchableHighlight`
borderRadius: 2px;
`;

const TouchContainer = styled.View`
flexDirection: row;
 alignItems: center;
  justifyContent: space-between;
   paddingVertical: 15px;
`;

const IconAndTextContainer = styled.View`
flexDirection: row;
 alignItems: center;
`;


const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'white',
    size: 'large',



}))``;


const style = StyleSheet.create({
    sheetContainer : {
        backgroundColor: Colors.primaryBody,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

    },
    displayNameBottomSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: 'black',
        elevation: 10,
    },
    pressable: {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        overflow: 'hidden',

    }
});
