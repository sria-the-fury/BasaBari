import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { TextComponent } from '../components/TextComponent';
import { Icon } from 'react-native-elements';
import { ScrollView , TouchableOpacity, PermissionsAndroid, Platform, Image} from 'react-native';

import ImagePicker from "react-native-customized-image-picker";
import {FirebaseContext} from "../context/FirebaseContext";
import {UserContext} from "../context/UserContext";





export default function SignUpScreen(props) {
    const [showPassword, setShowPassWord] = useState(true);
    const [profileImageUri, setProfileImageUri] = useState();
    const [loading, setLoading] = useState(false);

    const firebase = useContext(FirebaseContext);
    const [_, setUser] = useContext(UserContext);

    //for signUp
    const [userName,setUserName] = useState();
    const [email,setEmail] = useState();
    const [password,setPassword] = useState();
    const [phoneNumber, setPhoneNumber] = useState();

    const chooseProfileImage = () => {
        ImagePicker.openPicker({
            width: 800,
            height: 800,
            compressQuality: 80,
            minCompressSize: 120,
            cropping: true,
            imageLoader: 'UNIVERSAL'
        }).then(image => {
            setProfileImageUri(image[0].path);
        });

    }



    const signUp = async () =>{

        setLoading(true);
        const user =  { userName, email, password, profileImageUri, phoneNumber};

        try {
             const userCreated = await firebase.createUser(user);
             if(userCreated) setUser({isLoggedIn: true});

        }catch (error){
            removeTempImages();
            alert(error.message);

        } finally {
            setLoading(false);
        }

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
            <TopDesign>
                <LeftCircle />
                <RightCircle />
            </TopDesign>
            <HeaderText>
                <TextComponent bold center large color='#1c3787'>Basa Bari</TextComponent>

            </HeaderText>

            <TextComponent bold center large color='#1c3787' style={{marginBottom: 10, marginTop: 20}}>LET'S SIGN UP</TextComponent>

            <ProfilePhotoContainer >

                <TouchableOpacity onPress={() => chooseProfileImage()} style={{height: 120, width: 120, alignItems: 'center', justifyContent: 'center'}}>
                    {!profileImageUri ?
                        <Icon
                            name={'image'}
                            type='ionicon'
                            color={'grey'} size={50}
                        /> :
                        <ProfileImageView source={{uri: profileImageUri}}/>
                    }

                </TouchableOpacity>


            </ProfilePhotoContainer>

            <ScrollView>

                <MainContainer>

                    <FormContainer>


                        <LabelAndInputWrapper>
                            <Icon
                                name='person'
                                type='md'
                                color='#1c3787' size={30}
                            />

                            <TextInput placeholder={'Your Name'}
                                       autoCorrect={false} onChangeText={(userName) => setUserName(userName.trim()) }/>

                        </LabelAndInputWrapper>

                        <LabelAndInputWrapper>
                            <Icon
                                name='phone'
                                type='md'
                                color='#1c3787' size={30}
                            />
                            <TextComponent style={{fontSize: 18}}>+88</TextComponent>

                            <TextInput placeholder={'Phone No.'} autoCapitalize={'none'} dataDetectorTypes={'phoneNumber'} keyboardType={'phone-pad'} maxLength={11}
                                       autoCompleteType={'off'} onChangeText={(phone) => setPhoneNumber(phone.trim()) }/>

                        </LabelAndInputWrapper>

                        <LabelAndInputWrapper>
                            <Icon
                                name='email'
                                type='md'
                                color='#1c3787' size={30}
                            />

                            <TextInput placeholder={'Email'} autoCapitalize={'none'} keyboardType={'email-address'}
                                       autoCompleteType={'email'} autoCorrect={false} onChangeText={(email) => setEmail(email.trim()) }/>

                        </LabelAndInputWrapper>

                        <LabelAndInputWrapper>
                            <Icon
                                name='lock'
                                type='md'
                                color='#1c3787' size={30}
                            />

                            <TextInput placeholder={'Password'} autoCapitalize={'none'}
                                       autoCompleteType={'password'} autoCorrect={false} secureTextEntry={showPassword} onChangeText={(password) => setPassword(password.trim()) }/>

                            <Icon
                                name={showPassword ? 'visibility-off' : 'visibility'}
                                type='md'
                                color={showPassword ? 'grey' : 'black'} size={30} style={{ right: 5 }} onPress={() => setShowPassWord(!showPassword)}
                            />

                        </LabelAndInputWrapper>

                        <SignUpButton disabled={loading} onPress={() => signUp()}>
                            {loading ? (<Loading/>) : <TextComponent bold medium center color={'white'}>SIGN UP</TextComponent> }
                        </SignUpButton>

                        <SignInGoContainer>

                            <TouchableOpacity onPress={() => props.navigation.goBack()}>

                                <Icon
                                    name={'chevron-back-circle'}
                                    type='ionicon'
                                    color={'blue'} size={50}
                                />

                            </TouchableOpacity>
                            <TextComponent medium center>Already Have an Account ? </TextComponent>


                        </SignInGoContainer>



                    </FormContainer>

                </MainContainer>
            </ScrollView>



        </Container>
    );
}

const Container = styled.View`
                        flex:1;

                        `;

const TopDesign = styled.View`
                        position: absolute;
                        width: 100%;
                        top: -50px;
                        z-index: -100;

                        `;

const LeftCircle = styled.View`
                        backgroundColor: purple;
                        height: 200px;
                        width: 200px;
                        position: absolute;

                        top: -90px;
                        left: -50px;
                        borderRadius: 100px;

                        `;

const RightCircle = styled.View`
                        backgroundColor: #1c3787;
                        height: 400px;
                        width:400px;

                        top: -250px;
                        right: -80px;
                        borderRadius: 200px;

                        `;

const HeaderText = styled.View`
                        marginTop: 100px;

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

                        `;

const ProfileImageView = styled.Image`
                        height: 120px;
                        width: 120px;
                        borderRadius: 60px;

                        `;

const MainContainer = styled.View`
                        alignItems: center;



                        `;

const FormContainer = styled.KeyboardAvoidingView`

                        marginLeft: 20px;
                        marginRight: 20px;
                        width: 350px;


                        `;

const LabelAndInputWrapper = styled.View`
                        flexDirection: row;
                        borderRadius: 10px;
                        backgroundColor: #eddefc;
                        paddingHorizontal: 15px;
                        alignItems: center;
                        marginBottom: 20px;




                        `;

const TextInput = styled.TextInput`

                        fontSize: 18px;
                        width: 85%;

                        `;

const SignUpButton = styled.TouchableOpacity`
                        alignItems: center;
                        backgroundColor: #1c3787;
                        marginHorizontal: 100px;
                        paddingVertical: 10px;
                        borderRadius: 5px;
                        marginBottom: 20px;

                        `;

const SignInGoContainer = styled.View`
                        flexDirection: row;
                        alignItems: center;
                        justifyContent: center;

                        `;

const Loading = styled.ActivityIndicator.attrs(props => ({
    color: 'white',
    size: 'small',


}))``;



