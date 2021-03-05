import React, {useState, useContext} from "react";
import { View, Modal, Pressable, ScrollView, StatusBar } from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {FirebaseContext} from "../context/FirebaseContext";

export const UpdateEmailOrPasswordModal = (props) => {
    const {modalVisible, modalHide, updateType, email} = props;
    const [updatedEmail, setUpdatedEmail] = useState('');
    const [updatedPassword, setUpdatedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const firebase = useContext(FirebaseContext);

    const updateEmailOrPassWord = async () => {

        if(updateType === 'email'){
            setLoading(true);
            try{
                const isEmailUpdated = await firebase.updateEmail(updatedEmail);
                console.log('isEmailUpdated=>', isEmailUpdated);
                if(isEmailUpdated) modalHide();

            }catch (error){
                alert(error.message);
            }finally {
                setLoading(false);
            }

        }

        else if(updateType === 'password'){
            setLoading(true);

            try{
                const isPasswordUpdated = await firebase.updatePassword(updatedPassword);
                if(isPasswordUpdated) modalHide();

            } catch (e) {
                alert(e.message);

            } finally {
                setLoading(false);
            }

        }
    }




    const disableUpdateButton = () => {

        if(updateType ==='email') return (updatedEmail == '');
        else if(updateType === 'password') return (updatedPassword === '');


    }




    return (
        <Container>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    modalHide()
                }}
            >
                <CenteredModal>
                    <ModalView>
                        <ModalHeader>

                            <TextComponent bold semiLarge color={'red'}>UPDATE {updateType ==='email' ? 'EMAIL' : 'PASSWORD'}</TextComponent>
                            <Icon name={'close-circle'} type={'ionicon'} size={35} color={'red'}  onPress={() => modalHide()}/>

                        </ModalHeader>

                        <ModalBody>

                            {updateType === 'email' ?

                                <LabelAndInputWrapper>
                                    <Icon
                                        name='email'
                                        type='md'
                                        color='#1c3787' size={30}
                                    />

                                    <TextInput placeholder={email} autoCapitalize={'none'} keyboardType={'email-address'}
                                               autoCompleteType={'email'} autoCorrect={false} onChangeText={(updatedEmail) => setUpdatedEmail(updatedEmail.trim())}/>

                                </LabelAndInputWrapper>

                                :

                                <LabelAndInputWrapper>
                                    <Icon
                                        name='lock'
                                        type='md'
                                        color='#1c3787' size={30}
                                    />

                                    <TextInput placeholder={'Password'} autoCapitalize={'none'}
                                               autoCompleteType={'password'} autoCorrect={false} secureTextEntry={showPassword} onChangeText={(password) => setUpdatedPassword(password.trim()) }/>

                                    <Icon
                                        name={showPassword ? 'visibility-off' : 'visibility'}
                                        type='md'
                                        color={showPassword ? 'grey' : 'black'} size={30} style={{ right: 5 }} onPress={() => setShowPassword(!showPassword)}
                                    />

                                </LabelAndInputWrapper>

                            }


                            <UpdateButton disabled={loading || disableUpdateButton() } onPress={() => updateEmailOrPassWord()}>

                                {loading ? <Loading/> : <TextComponent bold center medium color={'white'}>UPDATE</TextComponent> }

                            </UpdateButton>
                        </ModalBody>




                    </ModalView>

                </CenteredModal>

            </Modal>
        </Container>
    );
};

const Container = styled.View`
   

`;

const CenteredModal = styled.View`
 flex: 1;
    justifyContent: center;
    alignItems: center;
    paddingHorizontal: 10px;

`;

const ModalView = styled.View`
width:100%;
maxWidth: 400px;
alignItems: center;
backgroundColor: white;
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 10px;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;


`;

const ModalHeader = styled.View`
flexDirection: row;
 alignItems: center;
 justifyContent:space-between;
 width:100%;
 paddingBottom: 20px

`;

const ModalBody = styled.View`

 justifyContent:space-between;
 width:100%;

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

const UpdateButton = styled.TouchableOpacity`
 alignItems: center;
                        backgroundColor: #1c3787;
                        marginHorizontal: 100px;
                        paddingVertical: 10px;
                        borderRadius: 5px;
                        marginBottom: 20px;
`;


const Loading = styled.ActivityIndicator.attrs(props => ({
    color: 'white',
    size: 'small',


}))``;




