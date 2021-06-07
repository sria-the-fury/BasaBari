import React from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon} from "react-native-elements";
import {Colors} from "../components/utilities/Colors";

export const TermsAndConditionsModal = (props) => {
    const {modalVisible, modalHide} = props;
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
                    <ModalHeader style={{backgroundColor: HeaderColor }}>
                        <Pressable onPress={() => modalHide()}>
                            <Icon name={'chevron-down'} type={'ionicon'} size={40} color={'white'}/>
                        </Pressable>
                        <TextComponent bold medium color={'white'}>TERMS & CONDITIONS</TextComponent>
                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{paddingHorizontal: 10, paddingVertical: 10}}>
                            <TextComponent medium justify multiline={true}>Here are a few examples:

                                The Intellectual Property disclosure will inform users that the contents, logo and other visual media you created is your property and is protected by copyright laws.
                                A Termination clause will inform that users' accounts on your website and mobile app or users' access to your website and mobile (if users can't have an account with you) can be terminated in case of abuses or at your sole discretion.
                                A Governing Law will inform users which laws govern the agreement. This should the country in which your company is headquartered or the country from which you operate your website and mobile app.
                                A Links To Other Web Sites clause will inform users that you are not responsible for any third party websites that you link to. This kind of clause will generally inform users that they are responsible for reading and agreeing (or disagreeing) with the Terms and Conditions or Privacy Policies of these third parties.
                                If your website or mobile app allows users to create content and make that content public to other users, a Content section will inform users that they own the rights to the content they have created. The "Content" clause usually mentions that users must give you (the website or mobile app developer) a license so that you can share this content on your website/mobile app and to make it available to other users.

                                Because the content created by users is public to other users, a DMCA notice clause (or Copyright Infringement ) section is helpful to inform users and copyright authors that, if any content is found to be a copyright infringement, you will respond to any DMCA takedown notices received and you will take down the content.

                                A Limit What Users Can Do clause can inform users that by agreeing to use your service, they're also agreeing to not do certain things. This can be part of a very long and thorough list in your Terms and Conditions agreements so as to encompass the most amount of negative uses.</TextComponent>
                        </View>
                    </ScrollView>



                </ModalView>
            </Modal>
        </Container>
    );
};

const HeaderColor = Colors.primaryBody;
const Container = styled.View`

`;

const ModalView = styled.View`
backgroundColor: white;
alignItems: center;
shadowColor: #000;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
height:100%;

`;

const ModalHeader = styled.View`
height:50px;
width:100%;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal:10px;

`;



// const styles = StyleSheet.create({
//     centeredView: {
//         flex: 1,
//         justifyContent: "center",
//     },
//     modalView: {
//         margin: 20,
//         backgroundColor: "white",
//         borderRadius: 20,
//         padding: 35,
//         alignItems: "center",
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 2
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//         e
//     },
//     button: {
//         borderRadius: 20,
//         padding: 10,
//         elevation: 2
//     },
//     buttonOpen: {
//         backgroundColor: "#F194FF",
//     },
//     buttonClose: {
//         backgroundColor: "#2196F3",
//     },
//     textStyle: {
//         color: "white",
//         fontWeight: "bold",
//         textAlign: "center"
//     },
//     modalText: {
//         marginBottom: 15,
//         textAlign: "center"
//     }
// });

