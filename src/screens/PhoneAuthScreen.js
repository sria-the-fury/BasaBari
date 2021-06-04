import React, {useContext, useState, useRef} from 'react';
import {Text, ToastAndroid, TouchableOpacity, View, Keyboard} from 'react-native';
import styled from "styled-components";
import {Icon} from "react-native-elements";
import {TextComponent} from "../components/TextComponent";
import {FirebaseContext} from "../context/FirebaseContext";
import {UserContext} from "../context/UserContext";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {TermsAndConditionsModal} from "../modals/TermsAndConditionsModal";
import LottieView from "lottie-react-native";
import {Colors} from "../components/utilities/Colors";
import {TextInput,} from "react-native-paper";

export default  function PhoneAuthScreen() {
    const [_,setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);
    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);

    const [number, setNumber] = useState('');

    //all otp
    const [OTP, setOTP] = useState({
        otp1: '',
        otp2: '',
        otp3: '',
        otp4: '',
        otp5: '',
        otp6: '',
    });


    const inputRefs = {
        otp1: useRef(),
        otp2: useRef(),
        otp3: useRef(),
        otp4: useRef(),
        otp5: useRef(),
        otp6: useRef(),
    };


    //loading after submit
    const [loading, setLoading] = useState(false);

    //sign in loading
    const [signInLoading,setSignInLoading] = useState(false);

    //check input is number
    const isInputHasNumber = /^0\d+[1-9]+$/g;
    const isNumber = isInputHasNumber.test(number);

    //openModal
    const [openTermsModal, setTermsModal] = useState(false);

    //functions for closing Modals
    const closeTermsModal = () => {
        setTermsModal(false);
    }


    const currentUser = firebase.getCurrentUser();


    const signInWithPhoneNumber = async () => {
        Keyboard.dismiss();
        setLoading(true);

        try {

            const phoneNumber = '+88'+number;
            const confirmation = await firebase.signInWithPhoneNumber(phoneNumber);
            if(confirmation) {
                ToastAndroid.show('OTP has been sent', ToastAndroid.SHORT);
                setConfirm(confirmation);
            }

        } catch (error){
            ToastAndroid.show(error.message, ToastAndroid.LONG);
            console.log('error in SignIn => ' + error.message);
        } finally {
            setLoading(false);
        }

    };

    const confirmCode = async () => {
        Keyboard.dismiss();
        setSignInLoading(true);
        try{
            let code = OTP.otp1+OTP.otp2+OTP.otp3+OTP.otp4+OTP.otp5+OTP.otp6;
            let data = await confirm.confirm(code);

            if(data.user.displayName && data.user.photoURL){
                const userInfo = await firebase.getUserInfo(data.user.uid);
                await firebase.userOnlineStatus(data.user.uid, true);
                setUser({
                    isLoggedIn: true,
                    userType: userInfo.userType,
                    userName: data.user.displayName,
                    profileImageUrl: data.user.photoURL,
                    userPhoneNumber: data.user.phoneNumber

                });
            }

            else{
                setSignInLoading(false)
                setUser({
                    isLoggedIn: false
                });
            }


        } catch (e) {
            setSignInLoading(false);
            console.log('error @submitCode'+e.message);
            ToastAndroid.show(e.message, ToastAndroid.LONG);

        }

    };

    const resendCode = async () => {
        setOTP({
            otp1: '',
            otp2: '',
            otp3: '',
            otp4: '',
            otp5: '',
            otp6: ''
        });

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
        const {otp1, otp2, otp3, otp4, otp5, otp6} = OTP;
        return (otp1 === '' || otp2 === '' || otp3 === '' || otp4 === '' || otp5 === '' || otp6 === '' );

    };

    const hasCurrentUser = async () => {

        if(currentUser && currentUser.displayName && currentUser.photoURL){
            const userInfo = await firebase.getUserInfo(currentUser.uid);
            await firebase.userOnlineStatus(currentUser?.uid, true);
            setUser({
                isLoggedIn: true,
                userType: userInfo.userType,
                userName: currentUser.displayName,
                profileImageUrl: currentUser.photoURL,
                userPhoneNumber: currentUser.phoneNumber

            });
        }

        if(currentUser && (!currentUser.displayName || !currentUser.photoURL)){
            setUser({
                isLoggedIn: false
            });

        }

    };



    return (
        <MainContainer>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryBody}/>

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


            <BodyContainer>
                <View style={{position: "absolute", top: -10, alignSelf: 'center', backgroundColor: '#320A28', paddingHorizontal: 10, borderRadius: 10}}>
                    {/*<LottieView source={require('../../assets/lottie-animations/basabari.json')} autoPlay loop style={{height: 40, alignItems: 'center', justifyContent: 'center'}} />*/}
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

                        <TextInput style={{backgroundColor: Colors.primaryBody, fontSize: 20, marginBottom: 30, color: 'white'}}
                                   mode={'outlined'}
                                   label="Phone Number"
                                   keyboardType={'phone-pad'}
                                   placeholder={'01*********'}
                                   placeholderTextColor={'grey'}
                                   maxLength={11}
                                   onChangeText={(number) => setNumber(number)}
                                   theme={{ colors: { placeholder: 'lavender', text: 'lavender', primary: 'lavender', underlineColor:'transparent'}}}

                                   left={
                                           <TextInput.Icon
                                               name={()=>

                                                   <Icon
                                                       name='phone'
                                                       type='md'
                                                       color='white' size={25}/>
                                               }
                                           />
                                   }
                        />


                        <TouchableOpacity disabled={disableSignIn() || !isNumber || loading} onPress={() => signInWithPhoneNumber()} style={{marginBottom: 20}}>
                            { loading ?
                                <LoadingView>
                                    <LottieView source={require('../../assets/lottie-animations/sending-otp.json')} autoPlay loop style={{width: 72}} />
                                </LoadingView>
                                :
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
                        <OTPInputsContainer style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10}}>
                            <OTPTextInput
                                onChange={ async () => {
                                    await hasCurrentUser()
                                    if(OTP.otp1 === ''){
                                        inputRefs.otp2.current.focus();
                                    }

                                }}
                                ref={inputRefs.otp1}

                                onChangeText={(otp1) => {
                                    setOTP((otp) => ({...otp, otp1: otp1}));

                                }}
                                keyboardType={'number-pad'} maxLength={1}/>

                            <OTPTextInput
                                onChange={ async() =>
                                {
                                    await hasCurrentUser();
                                    if(OTP.otp2 === '') inputRefs.otp3.current.focus();
                                    else inputRefs.otp1.current.focus();

                                }}
                                ref={inputRefs.otp2}

                                onChangeText={(otp2) => {
                                    setOTP((otp)=>({...otp, otp2: otp2}));

                                }}
                                keyboardType={'number-pad'} maxLength={1}/>

                            <OTPTextInput autoFocus={false}
                                          onChange={async () =>
                                          {
                                              await hasCurrentUser();
                                              if(OTP.otp3 === '') inputRefs.otp4.current.focus();
                                              else if(OTP.otp3 !== '') inputRefs.otp2.current.focus();

                                          }}
                                          ref={inputRefs.otp3}
                                          onChangeText={(otp3) => {
                                              setOTP((otp)=>({...otp, otp3: otp3}));
                                          }} keyboardType={'number-pad'} maxLength={1}/>

                            <OTPTextInput autoFocus={false}
                                          onChange={async () =>
                                          {
                                              await hasCurrentUser();
                                              if(OTP.otp4 === '') inputRefs.otp5.current.focus();
                                              else inputRefs.otp3.current.focus();

                                          }}
                                          ref={inputRefs.otp4}

                                          onChangeText={(otp4) => {
                                              setOTP((otp)=>({...otp, otp4: otp4}));
                                          }} keyboardType={'number-pad'} maxLength={1}/>

                            <OTPTextInput autoFocus={false}
                                          onChange={async () =>
                                          {
                                              await hasCurrentUser();
                                              if(OTP.otp5 === '') inputRefs.otp6.current.focus();
                                              else inputRefs.otp4.current.focus();

                                          }}
                                          ref={inputRefs.otp5}

                                          onChangeText={(otp5) => {
                                              setOTP((otp)=>({...otp, otp5: otp5}));
                                          }} keyboardType={'number-pad'} maxLength={1}/>

                            <OTPTextInput autoFocus={false}
                                          onChange={async () =>
                                          {
                                              await hasCurrentUser();
                                              if(OTP.otp6 !== '') inputRefs.otp5.current.focus();

                                          }}
                                          ref={inputRefs.otp6}
                                          onChangeText={(otp6) => {
                                              setOTP((otp)=>({...otp, otp6: otp6}));
                                          }} keyboardType={'number-pad'} maxLength={1}/>

                            <OTPAndCircularProgressContainer onPress={() => resendCode()}>

                                <ResendOTPButton>
                                    <Icon
                                        name='phonelink-lock'
                                        color={'lavender'}
                                        type='md'
                                        size={25}
                                    />

                                </ResendOTPButton>


                            </OTPAndCircularProgressContainer>

                        </OTPInputsContainer>



                        <BottomButtonContainer onPress={() => confirmCode()} disabled={disableOTPSubmit() || signInLoading}>

                            { signInLoading ?
                                <LoadingView>
                                    <LottieView source={require('../../assets/lottie-animations/entering.json')} autoPlay loop style={{width: 72}} />
                                </LoadingView> :
                                <View>
                                    <Icon
                                        name='home'
                                        color={disableOTPSubmit() ? 'grey' : 'white'}
                                        type='ionicon'
                                        size={50}
                                    />
                                    <TextComponent center color={disableOTPSubmit() ? 'grey' : 'white'}>SIGN IN</TextComponent>

                                </View>
                            }

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
            <TermsAndConditionsModal modalVisible={openTermsModal} modalHide={closeTermsModal}/>
        </MainContainer>

    );
}


const MainContainer = styled.SafeAreaView`
flex: 1;

backgroundColor: ${Colors.primaryBody};

`;

const BodyContainer = styled.View`
position: absolute;
bottom: 0;
width: 100%;
flex: 1;

justifyContent: center;
backgroundColor: ${Colors.primaryBodyLight};
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


const BottomButtonContainer = styled.TouchableOpacity`
marginBottom: 30px;
`;

const LogoContainer = styled.View`
marginTop: 30px;
alignItems: center;

`;


const TermsAndConditionsTouchArea = styled.TouchableOpacity`
position: absolute;
bottom: 0;
alignSelf: center;
paddingVertical: 5px;

`;

const ResendOTPButton = styled.View`
height: 30px;
width :30px;
alignItems: center;
justifyContent: center;
borderRadius: 20px;
`;



const OTPAndCircularProgressContainer = styled.TouchableOpacity`
alignItems: center;
justifyContent: center;
`;

const LoadingView = styled.View`
alignItems: center;
justifyContent: center;
`;


const OTPTextInput = styled.TextInput`
padding: 10px;
backgroundColor: ${Colors.primaryBody};
marginHorizontal: 5px;
textAlign: center;
borderRadius: 5px;
color: white;
fontSize: 20px;
borderColor: white;
borderWidth:1px;


`;

const OTPInputsContainer = styled.View`

`;