import React, {useContext, useState,useEffect} from 'react';
import {Button, Text, ToastAndroid, TouchableOpacity, View} from 'react-native';
import styled from "styled-components";
import {Icon} from "react-native-elements";
import {TextComponent} from "../components/TextComponent";
import {FirebaseContext} from "../context/FirebaseContext";
import {UserContext} from "../context/UserContext";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {TermsAndConditionsModal} from "../modals/TermsAndConditionsModal";
import LottieView from "lottie-react-native";
import {CircularProgress} from "../components/circular-progress/CircularProgress";

export default  function PhoneAuthScreen() {
    const [_, setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);
    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);

    const [code, setCode] = useState('');
    const [number, setNumber] = useState('');

    //loading after submit
    const [loading, setLoading] = useState(false);

    //resend button
    const [isResendDisable, setResendDisable] = useState(true);
    const [count, setCount] = useState(0);

    //check input is number
    const isInputHasNumber = /[0-9]+$/g;
    const isNumber = isInputHasNumber.test(number);

    //openModal
    const [openTermsModal, setTermsModal] = useState(false);

    //functions for closing Modals
    const closeTermsModal = () => {
        setTermsModal(false);
    }


    useEffect(() => {


        let interval = setInterval(() => {
            setCount(prev => {
                if (prev === 0) {
                    clearInterval(interval);
                    setResendDisable(false);

                }
                if(prev > 0) return prev - 1;
            })
        },1000)
        // interval cleanup on component unmount
        return () => clearInterval(interval);
    }, [isResendDisable]);

    const currentUser = firebase.getCurrentUser();


    const signInWithPhoneNumber = async () => {
        setLoading(true)

        try {
            const phoneNumber = '+88'+number;
            const confirmation = await firebase.signInWithPhoneNumber(phoneNumber);
            console.log('confirmation => ', confirmation);
            if(confirmation) {
                ToastAndroid.show('OTP has been sent', ToastAndroid.SHORT);
                setResendDisable(true);
                setCount(60);
                setConfirm(confirmation);
            }

        } catch (error){
            ToastAndroid.show(error.message, ToastAndroid.LONG);
            console.log('error in SignIn => ' + error.message);
        } finally {
            setLoading(false);
        }

    };

    const  confirmCode = async () => {
        try{
            let data = await confirm.confirm(code);

            if(data.user.displayName && data.user.photoURL){
                setUser({
                    isLoggedIn: true,
                    userName: data.user.displayName,
                    profileImageUrl: data.user.photoURL,
                    userPhoneNumber: data.user.phoneNumber

                });
            }

            else{
                setUser({
                    isLoggedIn: false
                });
            }


        } catch (e) {
            console.log('error @submitCode'+e.message);
            ToastAndroid.show(e.message, ToastAndroid.LONG);

        }

    };

    const resendCode = async () => {
        setCount(60);
        setResendDisable(true);

        try{
            await signInWithPhoneNumber();
        } catch (e) {
            ToastAndroid.show(e.message, ToastAndroid.SHORT);

        }

    }


    const disableSignIn = () => {
        return (number === '' || number.length !==11);

    };

    const disableOTPSubmit = () => {
        return (code.length !== 6)

    };

    const hasCurrentUser = () => {
        console.log('inHasUser');
        if(currentUser && currentUser.displayName && currentUser.photoURL){
            setUser({
                isLoggedIn: true,
                userName: currentUser.displayName,
                profileImageUrl: currentUser.photoURL,
                userPhoneNumber: currentUser.phoneNumber

            });
        }

        if(currentUser && !currentUser.displayName && !currentUser.photoURL){
            setUser({
                isLoggedIn: false
            });

        }

    };

    return (
        <MainContainer>
            <FocusedStatusbar barStyle="dark-content" backgroundColor={'#320A28'}/>

            <View  style={{marginTop: 30, alignItems: "center"}}>

                <LottieView source={require('../../assets/home.json')} autoPlay loop style={{width: 120}} />
            </View>


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


            <BodyContainer>
                <View style={{position: "absolute", top: -10, alignSelf: 'center', backgroundColor: '#320A28', paddingHorizontal: 10, borderRadius: 10}}>
                    <Text style={{color: 'white', fontSize: 30, fontFamily: 'JetBrainsMono-Regular'}}>BASA BARI</Text>
                </View>

                <View>
                    { !confirm ?
                        <Text style={{color: 'white', fontSize: 20, fontFamily: 'JetBrainsMono-Regular'}}>
                            LET'S START.
                        </Text>  :
                        <Text style={{color: 'white', fontSize: 20, fontFamily: 'JetBrainsMono-Regular'}}>
                            HURRY UP.
                        </Text>
                    }
                </View>

                { !confirm ?
                    <View>
                        <LabelAndInputWrapper>
                            <Icon
                                name='phone'
                                type='md'
                                color='#1c3787' size={30}
                            />

                            <TextComponent semiLarge>+88</TextComponent>

                            <TextInput placeholder={'Phone Number'} keyboardType={'number-pad'} maxLength={11}
                                       onChangeText={(number) => setNumber(number)}/>

                        </LabelAndInputWrapper>

                        <TouchableOpacity disabled={disableSignIn() || !isNumber || loading} onPress={() => signInWithPhoneNumber()} style={{marginBottom: 20}}>
                            { loading ? <Loading/> :
                                <View>
                                    <Icon
                                        name='finger-print'
                                        color={disableSignIn() || !isNumber ? 'grey' : 'white'}
                                        type='ionicon'
                                        size={50}
                                    />
                                    <TextComponent center color={disableSignIn() || !isNumber ? 'grey' : 'white'}>GET OTP</TextComponent>

                                </View>
                            }

                        </TouchableOpacity>

                    </View>
                    :
                    <View>

                        <OTPLabelAndInputWrapper>
                            <Icon
                                name='lock'
                                type='md'
                                color='#1c3787' size={30}
                            />

                            <OTPTextInput placeholder={'OTP Code'} keyboardType={'number-pad'} maxLength={6}
                                          value={code} onChange={() => hasCurrentUser()}
                                          onChangeText={text => setCode(text)}/>

                            <OTPAndCircularProgressContainer onPress={() => resendCode()} disabled={isResendDisable}>

                                <CircularProgress fillRatio={count} percentage={60} size={40}/>
                                <ResendOTPButton>
                                    <Icon
                                          name='phonelink-lock'
                                          color={isResendDisable ? 'grey' : 'black'}
                                          type='md'
                                          size={25}
                                    />

                                </ResendOTPButton>


                            </OTPAndCircularProgressContainer>


                        </OTPLabelAndInputWrapper>


                        <BottomButtonContainer onPress={() => confirmCode()} disabled={disableOTPSubmit()}>

                            <Icon
                                name='home'
                                color={disableOTPSubmit() ? 'grey' : 'white'}
                                type='ionicon'
                                size={50}
                            />
                            <TextComponent center color={disableOTPSubmit() ? 'grey' : 'white'}>SIGN IN</TextComponent>

                        </BottomButtonContainer>

                    </View>
                }
                <TermsAndConditionsTouchArea onPress={() => setTermsModal(true)}>
                    <TextComponent color={'white'} center>
                        By creating an account, you agree with
                    </TextComponent>
                    <TextComponent color={'white'} center>
                        Basa Bari's Terms & Conditions
                    </TextComponent>

                </TermsAndConditionsTouchArea>
            </BodyContainer>
            <TermsAndConditionsModal modalVisible={openTermsModal} modalHide={closeTermsModal} headerColor={'#320A28'}/>
        </MainContainer>

    );
}



const MainContainer = styled.SafeAreaView`
flex: 1;

backgroundColor: #320A28;

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



const LabelAndInputWrapper = styled.View`
flexDirection: row;
borderRadius: 10px;
backgroundColor: #eddefc;
paddingHorizontal: 15px;
alignItems: center;
marginBottom: 30px;


`;

const TextInput = styled.TextInput`

fontSize: 20px;
`;
const OTPLabelAndInputWrapper = styled.View`
flexDirection: row;
borderRadius: 10px;
backgroundColor: lavender;
overflow: hidden;

paddingHorizontal: 15px;
alignItems: center;
marginBottom: 30px;


`;

const OTPTextInput = styled.TextInput`
width: 80%;


fontSize: 20px;
`;

const BottomButtonContainer = styled.TouchableOpacity`
marginBottom: 30px;
`;

const LogoContainer = styled.View`
position: absolute;
top: -30px;
alignSelf: center;

`;

const Loading = styled.ActivityIndicator.attrs(props => ({
    color: 'white',
    size: 'large',


}))``;

const TermsAndConditionsTouchArea = styled.TouchableOpacity`
position: absolute;
 bottom: 0;
  alignSelf: center;
   paddingVertical: 5px;

`;

const ResendOTPButton = styled.View`
 height: 30px;
  width :30px;
  position: absolute;
  alignItems: center;
   justifyContent: center;
    borderRadius: 20px;
  
`;



const OTPAndCircularProgressContainer = styled.TouchableOpacity`
alignItems: center;
justifyContent: center;
`


