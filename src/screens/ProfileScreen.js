import React, {useContext, useRef, useState} from 'react';
import styled from "styled-components";
import {ActivityIndicator, Linking, StyleSheet, ToastAndroid, TouchableOpacity} from 'react-native';
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


export default function ProfileScreen(props) {

    const [loading, setLoading] = useState(false);
    const [nameLoading, setNameLoading] = useState(false);
    const [updatedName, setUpdateName] = useState('');


    // userContext
    const[_,setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);
    const profileUserInfo = firebase.getCurrentUser() ? firebase.getCurrentUser() : '';



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
        const loggedOut = await firebase.loggedOut();

        if(loggedOut) setUser({isLoggedIn: null});
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
            setLoading(true);
            await firebase.uploadProfilePhoto(path);
            setUser(prev => ({
                ...prev,
                profilePhotoUrl: profileUserInfo.photoURL
            }));


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
                uploadUpdateProfileImage(image[0].path).then(() => {
                    setLoading(false);
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
        await Linking.openURL('mailto: jakariamsria@gmail.com');
    };

    const UpdateNameBottomSheet = useRef();

    const disableUpdateNameButton = () => {
        return (updatedName.trim() === profileUserInfo.displayName || updatedName === '' || updatedName.length < 3);

    }



    return (

        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryStatusbarColor}/>
            <Header>
                <Icon name={'chevron-back-outline'} type={'ionicon'} size={35} color={'white'} onPress={() => props.navigation.goBack()}/>
                <TextComponent color={'white'} semiLarge bold center>PROFILE</TextComponent>
                <Icon name={'log-out'} type={'ionicon'} size={35} color={'red'} onPress={() => loggedOut()}/>

            </Header>


            <ScrollViewContainer showsVerticalScrollIndicator={false}>
                <InfoContainer>

                    <ProfileAndUserInfoContainer>

                        <ProfileImageContainer style={{elevation: 10,
                            shadowColor: '#000', shadowOpacity: 1,
                            shadowRadius: 5.32,}}>

                            <ProfileImage source={profileUserInfo.photoURL ? {uri : profileUserInfo.photoURL} : require('../../assets/default-profile-image.png')}/>
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
                                <Icon name={'person'} type={'material'} size={30} color={profileIconsColor} style={{marginRight: 3}}/>

                                <TextComponent bold color={'white'}  semiLarge>{profileUserInfo.displayName}</TextComponent>

                            </EachInfoWrapper>

                            <EachInfoWrapper>
                                <Icon name={'call'} type={'material'} size={25} color={profileIconsColor} style={{marginRight: 3}}/>

                                <TextComponent bold color={'white'}  medium>{profileUserInfo.phoneNumber}</TextComponent>

                            </EachInfoWrapper>

                        </UserInfo>
                    </ProfileAndUserInfoContainer>

                    <OpenBottomSheetButton onPress={() => UpdateNameBottomSheet.current.open()}>
                        <Icon name={'edit'} type={'material'} size={15} color={profileIconsColor} style={{marginRight: 3}}/>
                        <TextComponent color={'white'}>UPDATE NAME</TextComponent>
                    </OpenBottomSheetButton>


                </InfoContainer>

                <BodyContainer>

                    <SettingsCardContainer>
                        <Icon name={'add-location'} type={'material'} size={30} color={'white'} style={{marginRight: 10}}/>
                        <TextComponent bold medium color={'white'}>Set your Location</TextComponent>
                    </SettingsCardContainer>
                    <Divider backrgoundColor={'white'}/>


                    <SettingsCardContainer onPress={() => setTermsModal(true)}>
                        <Icon name={'article'} type={'material'} size={30} color={'white'} style={{marginRight: 10}}/>
                        <TextComponent bold medium color={'white'}>Terms & Conditions</TextComponent>
                    </SettingsCardContainer>

                    <Divider backrgoundColor={'white'}/>

                    <SettingsCardContainer onPress={() => mailTo()}>
                        <Icon name={'report-problem'} type={'material'} size={30} color={'orange'} style={{marginRight: 10}}/>
                        <TextComponent bold medium color={'white'}>Facing problem? Email US</TextComponent>
                    </SettingsCardContainer>

                </BodyContainer>
            </ScrollViewContainer>

            <RBSheet
                ref={UpdateNameBottomSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                dragFromTopOnly={true}
                height={150}

                customStyles={{
                    wrapper: {
                        backgroundColor: "transparent"
                    },
                    container: style.sheetContainer,

                }}
            >
                <TextInput style={{backgroundColor: Colors.primaryBody, fontSize: 20, marginTop: 30, paddingHorizontal: 10}}
                           mode={'outlined'}
                           label="Your Name"
                           defaultValue={profileUserInfo.displayName}
                           autoCompleteType={'name'} maxLength={23} autoCapitalize={'words'}
                           onChangeText={(updatedName) => setUpdateName(updatedName)}
                           theme={{ colors: { placeholder: 'lavender', text: 'lavender', primary: 'lavender', underlineColor:'transparent'}}}

                           onBlur={() => setUpdateName('')}
                           right={
                               nameLoading ?
                                   <TextInput.Icon name={ () =>
                                       <ActivityIndicator color={'white'} size={'large'}/>

                                   }/>


                                   :<TextInput.Icon name={ () =>

                                       <Icon raised reverse name={'cloud-upload-outline'} type={'ionicon'} size={15}
                                             color={disableUpdateNameButton() ? 'grey' : 'green'} onPress={() => updateUserName()}
                                             disabled={disableUpdateNameButton()}/>

                                   }/>
                           }

                           left={
                               <TextInput.Icon
                                   name={()=>

                                       <Avatar.Image size={30} source={{uri: profileUserInfo.photoURL}}/>
                                   }
                               />
                           }
                />

                <UpdateNameButton disabled={disableUpdateNameButton()}>
                    <Icon name={'edit'} type={'material'} size={20} color={profileIconsColor} style={{marginRight: 3}}/>
                    <TextComponent color={'white'} medium bold>UPDATE NAME</TextComponent>
                </UpdateNameButton>


            </RBSheet>



            <BottomContainer>
                <MyListingsButton onPress={() => props.navigation.navigate('MyListings')}>

                    <TextComponent center bold color={'white'}>MY LISTINGS</TextComponent>
                </MyListingsButton>

            </BottomContainer>

            <TermsAndConditionsModal modalVisible={openTermsModal} modalHide={closeTermsModal}/>

            {/*<MyListingsModal modalVisible={openMyListingsModal} modalHide={closeMyListingsModal} />*/}

        </Container>
    )
}


const StatusBarAndTopHeaderBGColor = '#d0ff00';
const profileIconsColor = 'white';
const Container = styled.SafeAreaView`

flex:1;
backgroundColor: ${Colors.primaryBodyLight};


`;

const Header = styled.View`
backgroundColor: ${Colors.primaryStatusbarColor};
paddingVertical: 10px;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal: 20px;
`

const InfoContainer = styled.View`
width:100%;
backgroundColor: ${Colors.primaryStatusbarColor};
paddingHorizontal: 10px;
paddingVertical: 10px
borderBottomRightRadius: 20px;
borderBottomLeftRadius: 20px;

`;

const ProfileAndUserInfoContainer = styled.View`
flexDirection: row;
alignItems: center;

`;

const ProfileImageContainer = styled.View`
height:120px;
width:120px;
backgroundColor: white;
alignItems: center;
justifyContent:center;
borderRadius:60px;
alignSelf: center;

`;
const ProfileImage = styled.Image`
height:110px;
width:110px;
borderRadius: 55px;


`;

const UserInfo = styled.View`
paddingHorizontal: 10px;
justifyContent: flex-start;
overflow:hidden;
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

const LoadingWrapper = styled.View`
backgroundColor: ${RNPColors.green400}
paddingHorizontal: 5px;
paddingVertical: 5px;
position: absolute;
alignSelf: center;
borderRadius: 50px;

`

const EachInfoWrapper = styled.View`
flexDirection : row;
alignItems: center;

`;


const BodyContainer = styled.View`
width:100%;
paddingVertical: 15px;
marginBottom: 50px;


`;

const ScrollViewContainer = styled.ScrollView`
backgroundColor: ${Colors.primaryBodyLight};
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
borderWidth:7px;
borderColor: ${Colors.primaryBodyLight};


`;

const SettingsCardContainer = styled.TouchableOpacity`
borderRadius: 15px;
paddingHorizontal:20px;
flexDirection: row
paddingVertical: 10px;
alignItems: center;

`;


const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'red',
    size: 'small',



}))``;


const style = StyleSheet.create({
    sheetContainer : {
        backgroundColor: Colors.primaryBody,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

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
