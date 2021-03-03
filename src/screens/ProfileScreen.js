import React, {useContext, useEffect, useState} from 'react';
import styled from "styled-components";
import {StatusBar, TouchableOpacity, View} from 'react-native';
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {TermsAndConditionsModal} from "../modals/TermsAndConditionsModal";
import {UserContext} from "../context/UserContext";
import {FirebaseContext} from "../context/FirebaseContext";
import {UpdateEmailOrPasswordModal} from "../modals/UpdateEmailOrPasswordModal";
import firestore from "@react-native-firebase/firestore";
import {ProfileUpdateModal} from "../modals/ProfileUpdateModal";
import ImagePicker from "react-native-customized-image-picker";


export default function ProfileScreen(props) {

    const [updateProfileImageUri, setUpdateProfileImageUri] = useState(null);
    const [loading, setLoading] = useState(false);

    //this components state
    const [userInfoFromCollection, setUserInfoFromCollection] = useState(null);


    // userContext
    const[_,setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);
    const profileUserInfo = firebase.getCurrentUser() ? firebase.getCurrentUser() : '';


    //openModal
    const [openTermsModal, setTermsModal] = useState(false);
    const [openProfileUpdateModal, setProfileUpdateModal] = useState(false);
    const [openEmailOrPassWordUpdateModal, setOpenEmailOrPassWordUpdateModal] = useState(false);

    //extra props with modal
    const [updateType, setUpdateType] = useState('');



//functions for closing Modals
    const closeTermsModal = () => {
        setTermsModal(false);
    }

    const closeProfileUpdateModal = () => {
        setProfileUpdateModal(false);
    }

    const closeEmailOrPassWordUpdateModal = () => {
        setOpenEmailOrPassWordUpdateModal(false);
    }

    //log out
    const loggedOut = async () => {
        const loggedOut = await firebase.loggedOut();

        if(loggedOut) setUser({isLoggedIn: false});
    }

    useEffect( () => {
        const subscriber = firestore().collection('users').doc(profileUserInfo.uid).onSnapshot(
            doc=> {
                setUserInfoFromCollection(doc.data());
            });

        return () => subscriber();
    },[]);


    const uploadUpdateProfileImage = async (path) => {
        try {
            console.log('hello');
            setLoading(true);
            await firebase.uploadProfilePhoto(path)

        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
            removeTempImages();
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
                console.log('okkk')
                uploadUpdateProfileImage(image[0].path).then(() => {
                    setLoading(false);
                })
            }
            setUpdateProfileImageUri(image[0].path);


        });

    }

    const removeTempImages = () => {
        ImagePicker.clean()
            .then(() => {

            })
            .catch(e => {
                console.log(e);
            });

    }



    return (

        <Container>
            <StatusBar barStyle={'dark-content'} backgroundColor={StatusBarAndTopHeaderBGColor}/>
            <HeaderTop>
                <View style={{alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                    <Icon raised name={'edit'} type={'material'} size={15} color={'grey'} onPress={() => setProfileUpdateModal(true)}/>
                    <TextComponent bold large  color={'#6526a5'} numberOfLines={1}>{profileUserInfo.displayName}</TextComponent>
                    <Icon raised name={'log-out'} type={'ionicon'} size={15} color={'red'} onPress={() => loggedOut()}/>
                </View>

                <ProfileAndUserInfoContainer>
                    <ProfileImageContainer style={{elevation: 10,
                        shadowColor: '#000', shadowOpacity: 1,
                        shadowRadius: 5.32,}}>

                        <ProfileImage source={profileUserInfo.photoURL ? {uri : profileUserInfo.photoURL} : require('../../assets/afjal.jpg')}/>
                        <TouchableOpacity style={{position: "absolute", top: 5, left:6, backgroundColor: 'white',borderColor: 'white', borderWidth: 4, borderRadius:50}}
                                          onPress={() => chooseProfileImage()} disabled={loading}>
                            { loading ? <Loading/> :
                                <Icon name={'add-photo-alternate'} type={'md'} size={24} color={'red'}
                                />
                            }
                        </TouchableOpacity>
                    </ProfileImageContainer>
                    <UserInfo>



                        <EachInfoWrapper>
                            <Icon name={'email'} type={'material'} size={24} color={profileIconsColor} style={{marginRight: 10}}/>
                            <TextComponent bold numberOfLines={1}>{profileUserInfo.email}</TextComponent>
                        </EachInfoWrapper>

                        {userInfoFromCollection ?
                            <EachInfoWrapper>
                                <Icon name={'call'} type={'material'} size={24} color={profileIconsColor} style={{marginRight: 10}}/>
                                <TextComponent bold numberOfLines={1} >{userInfoFromCollection.phoneNumber}</TextComponent>
                            </EachInfoWrapper>
                            : <TextComponent bold numberOfLines={1}>''</TextComponent>
                        }


                    </UserInfo>
                </ProfileAndUserInfoContainer>

            </HeaderTop>


            <ScrollViewContainer showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <BodyContainer>

                    <SettingsCardContainer>
                        <Icon name={'add-location'} type={'material'} size={30} color={'black'} style={{marginRight: 10}}/>
                        <TextComponent bold medium>Set your Location</TextComponent>
                    </SettingsCardContainer>

                    <UpdatePassWordAndEmailContainerCard>
                        <UpdateSettingsCardLeft onPress={() => {setOpenEmailOrPassWordUpdateModal(true); setUpdateType('email')}}>
                            <Icon name={'email'} type={'material'} size={30} color={'orangered'} style={{marginRight: 10}}/>
                            <TextComponent bold medium>Update Email </TextComponent>
                        </UpdateSettingsCardLeft>

                        <UpdateSettingsCardRight onPress={() => {setOpenEmailOrPassWordUpdateModal(true); setUpdateType('password')}}>
                            <Icon name={'lock'} type={'material'} size={30} color={'orangered'} style={{marginRight: 10}}/>
                            <TextComponent bold medium>Update Password</TextComponent>
                        </UpdateSettingsCardRight>

                    </UpdatePassWordAndEmailContainerCard>

                    <SettingsCardContainer>
                        <Icon name={'report-problem'} type={'material'} size={30} color={'orange'} style={{marginRight: 10}}/>
                        <TextComponent bold medium>Facing problem? Email US</TextComponent>
                    </SettingsCardContainer>

                    <SettingsCardContainer onPress={() => setTermsModal(true)}>
                        <Icon name={'article'} type={'material'} size={30} color={'black'} style={{marginRight: 10}}/>
                        <TextComponent bold medium>Terms & Conditions</TextComponent>
                    </SettingsCardContainer>

                </BodyContainer>
            </ScrollViewContainer>



            <BottomContainer>
                <MyListingsButton onPress={() => props.navigation.navigate('MyListingsAsModal')}>

                    <TextComponent center bold color={'white'}>MY LISTINGS</TextComponent>
                </MyListingsButton>

            </BottomContainer>

            <TermsAndConditionsModal modalVisible={openTermsModal} modalHide={closeTermsModal}/>
            <UpdateEmailOrPasswordModal modalVisible={openEmailOrPassWordUpdateModal} updateType={updateType}
                                        modalHide={closeEmailOrPassWordUpdateModal}/>
            {userInfoFromCollection ? <ProfileUpdateModal modalVisible={openProfileUpdateModal} modalHide={closeProfileUpdateModal}
                                                          userInfo={userInfoFromCollection}
            /> : null}
            {/*<MyListingsModal modalVisible={openMyListingsModal} modalHide={closeMyListingsModal} />*/}

        </Container>
    )
}


const StatusBarAndTopHeaderBGColor = '#d0ff00';
const profileIconsColor = '#5e0059';
const Container = styled.SafeAreaView`

flex:1;
backgroundColor: #39345b;


`;

const HeaderTop = styled.View`
height: 200px;
width:100%;
backgroundColor: ${StatusBarAndTopHeaderBGColor};
paddingHorizontal: 10px;
paddingVertical: 20px;

borderBottomRightRadius: 20px;
borderBottomLeftRadius: 20px;

`;

const ProfileAndUserInfoContainer = styled.View`
flexDirection: row;
top:0;
alignItems: center;
paddingHorizontal: 10px;
`;

const ProfileImageContainer = styled.View`

height:120px;
width:120px;
backgroundColor: white;
alignItems: center;
justifyContent:center;
borderRadius:60px;


`;
const ProfileImage = styled.Image`
height:110px;
width:110px;
borderRadius: 55px;


`;

const UserInfo = styled.View`
paddingHorizontal: 10px;
padding: 10px;
overflow:hidden;
`;

const EachInfoWrapper = styled.View`
flexDirection : row;
alignItems: center;
marginBottom: 5px;

`;


const BodyContainer = styled.View`
width:100%;
paddingVertical: 15px;
marginBottom: 50px;
marginTop: 50px;

`;

const ScrollViewContainer = styled.ScrollView`
backgroundColor: #39345b;
width:100%;
overflow:hidden;
marginBottom: 60px;



`;

const BottomContainer = styled.View`
backgroundColor: red;
alignItems: center;
justifyContent: center;
paddingHorizontal: 20px;
borderTopRightRadius: 20px;
borderTopLeftRadius: 20px;
bottom:0;
position: absolute;
width:100%;
height: 60px;

`;

const MyListingsButton = styled.TouchableOpacity`
backgroundColor: red;
paddingHorizontal: 20px;
paddingVertical: 15px;
borderRadius: 30px;
borderWidth:6px;
borderColor: #39345b;


`;

const SettingsCardContainer = styled.TouchableOpacity`
backgroundColor: white;
borderRadius: 15px;
paddingHorizontal:20px;
flexDirection: row
paddingVertical: 15px;
alignItems: center;
marginVertical: 10px;
`;

const UpdatePassWordAndEmailContainerCard = styled.View`
borderRadius: 15px;
flexDirection: row
paddingVertical: 20px;
alignItems: center;
justifyContent: space-between;
`;

const UpdateSettingsCardLeft = styled.TouchableOpacity`
backgroundColor: white;
paddingVertical: 10px;
flexDirection: row;
paddingHorizontal:20px;
borderBottomRightRadius: 15px;
borderTopRightRadius: 15px;
alignItems: center;
`;

const UpdateSettingsCardRight = styled.TouchableOpacity`
backgroundColor: white;
borderBottomLeftRadius: 15px;
borderTopLeftRadius: 15px;
paddingHorizontal:20px;
flexDirection: row
paddingVertical: 10px;
alignItems: center;
`;


const Loading = styled.ActivityIndicator.attrs(props => ({
    color: 'red',
    size: 'small',



}))``;
