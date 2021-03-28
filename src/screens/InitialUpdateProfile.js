import React, {useContext, useState} from 'react'
import {View, Text, TouchableOpacity, ToastAndroid, ActivityIndicator} from 'react-native'
import {Image} from "react-native-elements";
import styled from "styled-components";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import ImagePicker from "react-native-customized-image-picker";
import {FirebaseContext} from "../context/FirebaseContext";
import {UserContext} from "../context/UserContext";
import LottieView from "lottie-react-native";
import {Colors} from "../components/utilities/Colors";
import {TextInput} from "react-native-paper";

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
            if(image.length && getCurrentUser){
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
            setUpdateLoading(false);
            console.log(e.message + '@updateProfile');

        } finally {
            setUpdateLoading(false);
            setProfileImageUri(null);
        }

    };

    const disableSubmit = () => {
        return ( userName.length < 3 || (profileImageUri === null && getCurrentUser?.photoURL === null))
    }
    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={backgroundColor}/>
            <LogoContainer>

                <LottieView source={require('../../assets/lottie-animations/home.json')} autoPlay loop style={{width: 120}} />
            </LogoContainer>

            <View style={{marginTop: 30, alignItems: "center", flexDirection: "row", justifyContent: "space-between"}}>
                <View style={{height: 10, width:30, backgroundColor: 'white'}}/>

                <View style={{alignItems: "center"}}>
                    <Text style={{color: 'white', fontSize: 30, fontFamily: 'JetBrainsMono-Regular'}}>
                        FIND YOUR HOME

                    </Text>
                    <Text style={{color: 'white', fontSize: 20, fontFamily: 'JetBrainsMono-Light'}}>
                        Across the cities.
                    </Text>

                </View>
                <View style={{height: 10, width:30, backgroundColor: 'white'}}/>

            </View>

            <MiddleLogoContainer>

                <LottieView source={require('../../assets/lottie-animations/rent-home.json')} autoPlay loop style={{width: 250}} />
            </MiddleLogoContainer>



            <BodyContainer>

                <ProfilePhotoContainer>

                    <TouchableOpacity onPress={() => chooseProfileImage()} style={{height: 120, width: 120, alignItems: 'center', justifyContent: 'center'}}>

                        <View>
                            { getCurrentUser?.photoURL ?
                                <ProfileImageView source={{uri: getCurrentUser.photoURL }}/> :
                                profileImageUri ?
                                    <ProfileImageView source={{uri: profileImageUri}}/> :  <Icon
                                        name={'account-circle'}
                                        type='md'
                                        color={'#512945'} size={120}
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

                <TextInput style={{backgroundColor: Colors.primaryBody, fontSize: 20, marginBottom: 30, marginTop: 60}}
                           mode={'outlined'}
                           label="Your Name"
                           autoCompleteType={'name'} maxLength={23} autoCapitalize={'words'}
                           onChangeText={(name) => setUserName(name)}

                           left={
                               <TextInput.Icon
                                   name={()=>

                                       <Icon
                                           name='person'
                                           type='md'
                                           color='white' size={25}/>
                                   }
                               />
                           }
                />


                { updateLoading ?
                    <LoadingView>
                        <LottieView source={require('../../assets/lottie-animations/loading.json')} autoPlay loop style={{width: 45}} />
                    </LoadingView>
                    :
                    <TouchableOpacity disabled={disableSubmit() || loading || updateLoading} onPress={() => updateProfile()}
                                      style={{flexDirection: 'row', alignItems: 'center', alignSelf: "center", backgroundColor: disableSubmit() ?  'white' : '#31bae0', padding: 6, borderRadius: 5}}>
                        { getCurrentUser && getCurrentUser.photoURL ?
                            <Image  PlaceholderContent={<ActivityIndicator style={{color: 'blue'}}/>}
                                    source={{uri: getCurrentUser.photoURL}} style={{height: 25, width: 25, borderRadius:50, marginRight: 5}}/>

                            :

                            <Icon name={'person'} type={'md'} color={disableSubmit() ? 'grey' : 'white'} size={25} style={{ marginRight: 5}}/>
                        }
                        <TextComponent semiLarge bold color={disableSubmit() ? 'grey' : 'white'}>SET PROFILE</TextComponent>

                    </TouchableOpacity>
                }


            </BodyContainer>
        </Container>
    )
};

export default InitialUpdateProfile;

const backgroundColor = '#320A28';

const Container = styled.SafeAreaView`
backgroundColor: ${backgroundColor};
flex: 1;

`;


const ProfilePhotoContainer = styled.View`
position: absolute;
top: -65px;
borderWidth: 5px;
borderColor: ${backgroundColor};
                        marginTop: 10px;
                        marginBottom: 20px;
                        height: 130px;
                        width:130px;
                        backgroundColor: #f4e1e1;
                        alignSelf: center;
                        borderRadius: 65px;
                        alignItems: center;
                        justifyContent: center;
                        shadowColor: #ffffff;
                        elevation: 5;

                        `;

const ProfileImageView = styled.Image`
                        height: 120px;
                        width: 120px;
                        borderRadius: 60px;

                        `;

const LabelAndInputWrapper = styled.View`
flexDirection: row;
borderRadius: 10px;
backgroundColor: lavender;
paddingHorizontal: 15px;
alignItems: center;
width: 100%;
marginTop: 60px;
marginBottom: 30px;


`;


const Loading = styled.ActivityIndicator.attrs(() => ({
    color: 'white',
    size: 'large',



}))``;

const LogoContainer = styled.View`
marginTop: 30px;
 alignItems: center;

`;

const MiddleLogoContainer = styled.View`
marginTop: 30px;
height: 260px;
backgroundColor: white;
 alignItems: center;


`;



const BodyContainer = styled.View`
position: absolute;
bottom: 0;
width: 100%;
flex: 1;

justifyContent: center;
backgroundColor: #512945;
paddingVertical: 40px;
paddingHorizontal: 20px;
alignSelf: center;
borderTopRightRadius: 20px;
borderTopLeftRadius: 20px;

`;

const LoadingView = styled.View`
alignItems: center;
justifyContent: center;
`;

