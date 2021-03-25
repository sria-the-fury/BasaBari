import React, {useContext, useState} from 'react';
import styled from "styled-components";
import {StatusBar, TextInput, TouchableOpacity, View} from 'react-native';
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {TermsAndConditionsModal} from "../modals/TermsAndConditionsModal";
import {UserContext} from "../context/UserContext";
import {FirebaseContext} from "../context/FirebaseContext";
import ImagePicker from "react-native-customized-image-picker";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";


export default function ProfileScreen(props) {

    const [loading, setLoading] = useState(false);
    const [nameLoading, setNameLoading] = useState(false);
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [updatedName, setUpdateName] = useState('');
    const [updatedPhone, setUpdatePhone] = useState('');


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

    //cell update

    const editCellNo = () => {
        setEditableCellNo(true)

    }

    const cancelUpdatePhone = () => {
        setEditableCellNo(false)
        setUpdatePhone('');

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
            const isNameUpdated = await firebase.updateUserProfileName(newName);

            if(isNameUpdated){
                cancelUpdateName();
            }

        }catch (e) {
            alert(e.message);

        }
        finally {

            setNameLoading(false);
            cancelUpdateName();

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

    }


    return (

        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryStatusbarColor}/>
            <HeaderTop>
                <View style={{alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginBottom: 3}}>
                    { (isEditable && updatedName === '') || (updatedName.trim() === profileUserInfo.displayName) ?
                        <Icon reverse name={'close-circle-outline'} type={'ionicon'} size={15} color={'red'} onPress={() => cancelUpdateName()}/>
                        :  isEditable && (updatedName !== '') &&  (updatedName.trim() !== profileUserInfo.displayName) && !nameLoading ?
                            <Icon raised reverse name={'cloud-upload-outline'} type={'ionicon'} size={15} color={'green'} onPress={() => updateUserName()} disabled={updatedName.length<3}/> :
                            isEditable && (updatedName !== '') &&  (updatedName.trim() !== profileUserInfo.displayName) && nameLoading ?
                                <View style={{backgroundColor: 'white', padding: 6, borderRadius:50, marginLeft: 8}}>
                                    <Loading/></View>
                                : <Icon raised name={'edit'} type={'material'} size={15} color={'grey'} onPress={() => editName()}/>
                    }
                    <TextInput defaultValue={profileUserInfo.displayName} style={{fontWeight: "bold", fontSize: 20, color: 'white',  backgroundColor: isEditable ? Colors.primaryBodyLight : null,
                        borderRadius: isEditable ? 20 : null, paddingHorizontal: isEditable ? 10 : null,
                    }}
                               autoCapitalize={'words'} autoFocus={isEditable} editable={isEditable} onFocus={() => setEditable(true)}
                               onBlur={() => {setEditable(false);
                                   setUpdateName('');
                               } }
                               maxLength={23} onChangeText={(updateName) => setUpdateName(updateName)}
                    />
                    {/*<TextComponent bold large  color={'#6526a5'} numberOfLines={1}>{profileUserInfo.displayName}</TextComponent>*/}
                    <Icon name={'log-out'} type={'ionicon'} size={25} color={'red'} onPress={() => loggedOut()}/>
                </View>

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
                        <Icon name={'call'} type={'material'} size={24} color={profileIconsColor} style={{marginRight: 10}}/>

                        <TextInput defaultValue={profileUserInfo.phoneNumber} style={{fontWeight: "bold", fontSize: 16, color: 'white'
                        }} keyboardType={'number-pad'}

                                   editable={false}
                                   maxLength={14}
                        />

                        {/*{(isEditableCellNo && updatedPhone === '') || (updatedPhone.trim() === profileUserInfo.phoneNumber) ?*/}
                        {/*    <Icon reverse name={'close-circle-outline'} type={'ionicon'} size={15} color={'red'} onPress={() => cancelUpdatePhone()}/>*/}
                        {/*    :  isEditableCellNo && (updatedPhone !== '') &&  (updatedPhone.trim() !== profileUserInfo.phoneNumber) && !phoneLoading ?*/}
                        {/*        <Icon raised reverse name={'cloud-upload-outline'} type={'ionicon'} size={15} color={'green'} onPress={() => updatePhoneNumber()} disabled={updatedPhone.length < 11}/> :*/}
                        {/*        isEditableCellNo && (updatedPhone !== '') &&  (updatedPhone.trim() !== profileUserInfo.phoneNumber) && phoneLoading ?*/}
                        {/*            <View style={{backgroundColor: 'white', padding: 6, borderRadius:50, marginLeft: 8}}>*/}
                        {/*                <Loading/></View>*/}
                        {/*            : <Icon raised name={'edit'} type={'material'} size={15} color={'grey'} onPress={() => editCellNo()}/>*/}
                        {/*}*/}
                    </EachInfoWrapper>



                </UserInfo>



            </HeaderTop>


            <ScrollViewContainer showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <BodyContainer>

                    <SettingsCardContainer>
                        <Icon name={'add-location'} type={'material'} size={30} color={'black'} style={{marginRight: 10}}/>
                        <TextComponent bold medium>Set your Location</TextComponent>
                    </SettingsCardContainer>

                    {/*<UpdatePassWordAndEmailContainerCard>*/}
                    {/*    <UpdateSettingsCardLeft onPress={() => {setOpenEmailOrPassWordUpdateModal(true); setUpdateType('email')}}>*/}
                    {/*        <Icon name={'email'} type={'material'} size={30} color={'orangered'} style={{marginRight: 10}}/>*/}
                    {/*        <TextComponent bold medium>Update Email </TextComponent>*/}
                    {/*    </UpdateSettingsCardLeft>*/}

                    {/*    <UpdateSettingsCardRight onPress={() => {setOpenEmailOrPassWordUpdateModal(true); setUpdateType('password')}}>*/}
                    {/*        <Icon name={'lock'} type={'material'} size={30} color={'orangered'} style={{marginRight: 10}}/>*/}
                    {/*        <TextComponent bold medium>Update Password</TextComponent>*/}
                    {/*    </UpdateSettingsCardRight>*/}

                    {/*</UpdatePassWordAndEmailContainerCard>*/}

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

const HeaderTop = styled.View`
height: 240px;
width:100%;
backgroundColor: ${Colors.primaryStatusbarColor};
paddingHorizontal: 10px;
paddingVertical: 10px;

borderBottomRightRadius: 20px;
borderBottomLeftRadius: 20px;

`;

// const ProfileAndUserInfoContainer = styled.View`
// flexDirection: row;
// top:0;
// alignItems: center;
// paddingHorizontal: 10px;
// `;

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
marginVertical: 5px;
alignItems:center;
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


const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'red',
    size: 'small',



}))``;
