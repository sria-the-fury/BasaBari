import React, {useContext, useState, useEffect} from 'react';
import {Button, ToastAndroid, View} from 'react-native';
import styled from "styled-components";
import {Icon} from "react-native-elements";
import {TextComponent} from "../components/TextComponent";
import {FirebaseContext} from "../context/FirebaseContext";
import {UserContext} from "../context/UserContext";

export default  function PhoneAuthScreen() {
    const [_, setUser] = useContext(UserContext);
    const firebase = useContext(FirebaseContext);
    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);

    const [code, setCode] = useState('');
    const [number, setNumber] = useState('');
    // const number = '+8801759040757';

    const currentUser = firebase.getCurrentUser();

    useEffect(() => {
        return () => {
            if(currentUser && (currentUser.displayName && currentUser.photoURL)){
                setUser({
                    isLoggedIn: true,
                    userName: currentUser.displayName,
                    profileImageUrl: currentUser.photoURL,
                    userPhoneNumber: currentUser.phoneNumber

                });
            } else{
                setUser({
                    isLoggedIn: false
                });
            }
        };
    }, [currentUser]);

    // Handle the button press
    // async function signInWithPhoneNumber() {
    //     const confirmation = await auth().signInWithPhoneNumber(number, true);
    //
    //     if(confirmation) setConfirm(confirmation);
    // }

    const signInWithPhoneNumber = async () => {

        try {
            const phoneNumber = '+88'+number;
            const confirmation = await firebase.signInWithPhoneNumber(phoneNumber);
            console.log('confirmation => ', confirmation);
            if(confirmation) setConfirm(confirmation);

        } catch (error){
            ToastAndroid.show(error.message, ToastAndroid.LONG);
            console.log('error in SignIn => ' + error.message);
        }

    };

    async function confirmCode() {
        try{
            let data = await confirm.confirm(code);
            console.log('data.additionalUserInfo.isNewUser=>', data.additionalUserInfo.isNewUser);
            console.log('data.user.displayName=>', data.user.displayName);
            console.log('data.user.photoURL=>', data.user.photoURL);
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

    // async function confirmCode() {
    //     try {
    //         let data = await confirm.confirm(code);
    //         console.log("Data=>", data);
    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // }
    // // console.log('code => ', code);
    // console.log('confirm => ', confirm);
    console.log('currentUser => ', currentUser);

    const disableSignIn = () => {
        return (number === '' || number.length !==11);

    };

    const disableOTPSubmit = () => {
        return (code.length !== 6)

    };

    if (!confirm) {
        return (
            <View style={{flex:1, justifyContent: 'center'}}>
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
                {/*<TextInput onChangeText={number => setNumber(number)} style={{backgroundColor: 'lavender', alignItems: "center"}} keyboardType={'number-pad'}/>*/}
                <Button
                    title="SIGN IN" disabled={disableSignIn()}
                    onPress={() => signInWithPhoneNumber()}
                />
            </View>

        );
    }

    return (
        <View style={{flex: 1, justifyContent: "center"}}>
            <TextInput value={code}
                       onChangeText={text => setCode(text)}
                       style={{backgroundColor: 'lavender', alignItems: "center"}} keyboardType={'number-pad'}
                       maxLength={6}/>
            <Button title="Confirm Code" onPress={() => confirmCode()} disabled={disableOTPSubmit()}/>
        </View>
    );
}

const NumberInputContainer = styled.View`


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
