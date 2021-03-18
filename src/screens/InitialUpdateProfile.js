import React, {useContext, useState} from 'react'
import {View, Text, TouchableOpacity, Button, ToastAndroid} from 'react-native'
import styled from "styled-components";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import ImagePicker from "react-native-customized-image-picker";
import {FirebaseContext} from "../context/FirebaseContext";
import {UserContext} from "../context/UserContext";

const InitialUpdateProfile = (props) => {
    const [_, setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);
    const getCurrentUser = firebase.getCurrentUser();

    const [profileImageUri, setProfileImageUri] = useState(null);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);



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
            setProfileImageUri(image[0].path);
            if(image.length){
                updateProfileImage(image[0].path).then(() => {
                    setLoading(false);
                });
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

    const updateProfileImage = async (path) => {
        setLoading(true);
        try{
            await firebase.uploadProfilePhoto(path);


        } catch (e) {
            ToastAndroid.show(e.message, ToastAndroid.LONG);

        } finally {
            removeTempImages();

        }

    };

    const updateProfile = async () => {
        setUpdateLoading(true);
        try {
            await firebase.createUser(userName);

            setUser({
                isLoggedIn: true,
                userName: getCurrentUser.displayName,
                profileImageUrl: getCurrentUser.photoURL,
                userPhoneNumber: getCurrentUser.phoneNumber

            });

            console.log('isUserCreated => ', isUserCreated);


        } catch (e) {
            console.log(e.message + '@updateProfile');

        } finally {
            setUpdateLoading(false);
            setProfileImageUri(null);
        }

    };
    console.log('profileImageUri=>', profileImageUri);

    const disableSubmit = () => {
        return ( userName.length < 3 || (profileImageUri === null && getCurrentUser.photoURL === null))
    }
    return (
        <Container>
            <FocusedStatusbar barStyle="dark-content" backgroundColor={'white'}/>
            <TextComponent bold large center>LET'S INIT PROFILE..</TextComponent>
            <InputContainer>

                <ProfilePhotoContainer >

                    <TouchableOpacity onPress={() => chooseProfileImage()} style={{height: 120, width: 120, alignItems: 'center', justifyContent: 'center'}}>


                        <View>
                            { getCurrentUser && getCurrentUser.photoURL ?
                                <ProfileImageView source={{uri: getCurrentUser.photoURL }}/> :
                                profileImageUri ?
                                    <ProfileImageView source={{uri: profileImageUri}}/> :  <Icon
                                        name={'image'}
                                        type='ionicon'
                                        color={'grey'} size={50}
                                    />

                            }

                            { loading ?
                                <View style={{position: 'absolute', left: 40, top: 40}}>
                                    <Loading/>
                                </View> : null
                            }

                        </View>


                    </TouchableOpacity>


                </ProfilePhotoContainer>
                <LabelAndInputWrapper>
                    <Icon
                        name='person'
                        type='md'
                        color='#1c3787' size={30}
                    />

                    <TextInput placeholder={'Your Name'} autoCompleteType={'name'} maxLength={23} autoCapitalize={'words'}
                               onChangeText={(name) => setUserName(name)}/>

                </LabelAndInputWrapper>

                <Button title={updateLoading ? "Updating.." : 'UPDATE PROFILE'} onPress={() => updateProfile()} disabled={disableSubmit() || loading}/>

            </InputContainer>
        </Container>
    )
}

export default InitialUpdateProfile;

const Container = styled.SafeAreaView`
backgroundColor: white;
flex: 1;
justifyContent: center;
paddingHorizontal: 10px;

`;

const InputContainer = styled.View`
marginHorizontal: 30px;
backgroundColor: lavender;
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 5px;
alignItems: center;


`;

const ProfilePhotoContainer = styled.View`
                        marginTop: 10px;
                        marginBottom: 20px;
                        height: 120px;
                        width:120px;
                        backgroundColor: #f4e1e1;
                        alignSelf: center;
                        borderRadius: 60px;
                        alignItems: center;
                        justifyContent: center;
                        shadowColor: #000;
                        elevation: 10;

                        `;

const ProfileImageView = styled.Image`
                        height: 120px;
                        width: 120px;
                        borderRadius: 60px;

                        `;

const LabelAndInputWrapper = styled.View`
flexDirection: row;
borderRadius: 10px;
backgroundColor: white;
paddingHorizontal: 15px;
alignItems: center;
width: 100%;
marginBottom: 30px;


`;

const TextInput = styled.TextInput`
fontSize: 20px;
`;

const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'white',
    size: 'large',



}))``;


