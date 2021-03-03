import React, {useContext, useState} from "react";
import {View, Modal, Pressable, ScrollView, TouchableOpacity} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import ImagePicker from "react-native-customized-image-picker";
import {FirebaseContext} from "../context/FirebaseContext";

export const ProfileUpdateModal = (props) => {
    const {modalVisible, modalHide, userInfo} = props;

    const [loading, setLoading] = useState(false);

    const [updateProfileImageUri, setUpdateProfileImageUri] = useState(null);
    const [updatePhoneNumber, setUpdatePhoneNumber] = useState(userInfo.phoneNumber);
    const [updateUserName, setUpdateUserName] = useState(userInfo.userName);
    //const [updateProfileImageUri, setUpdateProfileImageUri] = useState(null);

    const firebase = useContext(FirebaseContext);


    const updateProfile = async () => {
        setLoading(true)

        const updatedUserInfo = {updateProfileImageUri, updatePhoneNumber, updateUserName}
        try {
            const isUpdated = await firebase.updateProfileInfo(updatedUserInfo);

            if(isUpdated){

                modalHide();
            }
        } catch (error) {
            alert(error.message);

        }finally {
            removeTempImages();
            setLoading(false);
        }
    }


    const chooseProfileImage = () => {
        ImagePicker.openPicker({
            width: 800,
            height: 800,
            compressQuality: 80,
            minCompressSize: 120,
            cropping: true,
            imageLoader: 'UNIVERSAL'
        }).then(image => {
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


    const disableUpdate = () => {

        return (loading || (updatePhoneNumber === '' || updateUserName === ''));
    }


    const checkTwoValues =  () => {
        return (updatePhoneNumber === userInfo.phoneNumber && updateUserName === userInfo.userName && updateProfileImageUri === null);
    }


    return (
        <Container>
            {/*<StatusBar barStyle={'dark-content'} backgroundColor={StatusBarAndTopHeaderBGColor}/>*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    modalHide()
                }}
            >
                <ModalView>
                    <ModalHeader>
                        <Pressable onPress={() => modalHide()}>
                            <Icon name={'chevron-down-circle'} type={'ionicon'} size={40}/>
                        </Pressable>

                        <TextComponent bold medium >UPDATE PROFILE</TextComponent>

                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false}>


                        <TouchableOpacity onPress={() => chooseProfileImage()}>
                            <ImageUploadContainer style={{paddingHorizontal: 10, paddingVertical: 10}}>
                                {
                                    updateProfileImageUri ?


                                        <ImageUploader
                                            source={{uri: updateProfileImageUri}}/>

                                        :
                                        <ImageUploader
                                            source={{uri: userInfo ? userInfo.profilePhotoUrl : ''}}/>
                                }

                            </ImageUploadContainer>
                            <View style={{
                                alignSelf: "center",
                                position: "absolute",
                                justifyContent: 'center',
                                top: 60
                            }}>
                                <Icon name={'add-photo-alternate'} type={'material'} size={70}
                                      color={'rgba(255, 255, 255, 0.7)'}/>
                            </View>

                        </TouchableOpacity>

                        <InputsContainer>

                            <LabelAndInputWrapper>
                                <Icon
                                    name='person'
                                    type='md'
                                    color='#1c3787' size={30}
                                />

                                <TextInput placeholder={'Your Name'} value={updateUserName}
                                           autoCorrect={false} onChangeText={(userName) => setUpdateUserName(userName) }/>

                            </LabelAndInputWrapper>

                            <LabelAndInputWrapper>
                                <Icon
                                    name='phone'
                                    type='md'
                                    color='#1c3787' size={30}
                                />
                                <TextComponent style={{fontSize:18}}>+88</TextComponent>

                                <TextInput placeholder={'Phone No.'} autoCapitalize={'none'} value={updatePhoneNumber}
                                           dataDetectorTypes={'phoneNumber'} keyboardType={'phone-pad'} maxLength={14}
                                           autoCorrect={false} onChangeText={(phone) => setUpdatePhoneNumber(phone) }/>

                            </LabelAndInputWrapper>

                            <TouchableOpacity disabled={disableUpdate() || checkTwoValues()} onPress={() => updateProfile()} style={{backgroundColor: '#1c3787', marginTop: 20,
                                paddingVertical: 10, paddingHorizontal: 10, borderRadius: 3, alignItems: "center"}}>
                                {loading ? <Loading/> : <TextComponent center bold medium color={'white'}>UPDATE PROFILE</TextComponent>}

                            </TouchableOpacity>

                        </InputsContainer>

                    </ScrollView>


                </ModalView>
            </Modal>
        </Container>
    );
};

const StatusBarAndTopHeaderBGColor = '#d0ff00';
const Container = styled.View`

`;

const ModalView = styled.View`
backgroundColor: white;
borderRadius: 20px;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
height:100%;

`;

const ModalHeader = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};
paddingVertical: 10px;
width:100%;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal:20px;

`;


const ImageUploadContainer = styled.TouchableOpacity`
alignItems: center;
justifyContent: center;


`

const ImageUploader = styled.Image`
height: 180px;
width: 180px;
borderColor: rgba(0,0,0, 0.3);
borderWidth: 5px;
borderRadius: 90px;

`;

const InputsContainer = styled.View`
paddingHorizontal: 10px;
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

const Loading = styled.ActivityIndicator.attrs(props => ({
    color: 'white',
    size: 'small',


}))``;
