import React, {useEffect, useRef, useState, useContext} from "react";
import {View, ScrollView, FlatList, Linking, ActivityIndicator, StyleSheet, ToastAndroid} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Divider, Icon, Image} from "react-native-elements";
import {ListingsUpdateModal} from "../modals/ListingsUpdateModal";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";
import firestore from "@react-native-firebase/firestore";
import RBSheet from "react-native-raw-bottom-sheet";
import {FirebaseContext} from "../context/FirebaseContext";


export const ListingDetailsScreen = (props) => {
    const firebase = useContext(FirebaseContext);
    const {route, navigation} = props;
    const {params} = route;
    const currentUserId = firebase.getCurrentUser().uid;

    const {listingId, listingsData, postedUserInfo, currentUserListings} = params;
    const [listingData, setListingData] = useState(listingsData);


    useEffect(() => {

        const subscriber = firestore().collection('listings').doc(listingId).onSnapshot(
            doc=> {

                if(doc) {

                    setListingData(doc.data());
                }


            });

        return () => subscriber();


    }, []);

    const {images, roomNumbers, facilities, forBachelor, forFamily,address, rentPerMonth, isNegotiable, moreDetails, location, interestedTenantId} = listingData;



    const makeCall = async (number) => {
        await Linking.openURL('tel:'+number);
    }

    //open update modal
    const [openListingUpdateModal, setListingUpdateModal] = useState(false);

    const closeListingUpdateModal = () => {
        setListingUpdateModal(false);
    }

    //SendMessageBottomSheet

    const SendMessageBottomSheet = useRef();

    const [message, setMessage] = useState('Is it still available?');
    const [sendingMessage, setSendingMessage] = useState(false);

    const SendMessageToLandlord = async () => {
        setSendingMessage(true);
        try {
            const postedUserId = listingData.userId;
            await firebase.sendMessage(postedUserId, currentUserId, message, [], listingId);


        }catch (e) {
            setSendingMessage(false);
            ToastAndroid.show(e.message+'@sending Message', ToastAndroid.LONG);

        }
        finally {
            setSendingMessage(false);
            ToastAndroid.show('Message Sent', ToastAndroid.SHORT);
            SendMessageBottomSheet.current.close();

        }
    }

    const isCurrentUserInterested = interestedTenantId?.includes(currentUserId);


    const isSendMessageOrGoMessageScreen = () => {
        if(isCurrentUserInterested) navigation.navigate('Messages');
        else SendMessageBottomSheet.current.open();
    }

    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={StatusBarAndTopHeaderBGColor}/>

            <ModalView>
                <ModalHeader>
                    <Icon name={'chevron-back-outline'} type={'ionicon'} size={35} color={'white'} onPress={() => navigation.goBack()}/>
                    <TextComponent bold medium color={'white'}>LISTING DETAILS</TextComponent>
                </ModalHeader>



                <ScrollView showsVerticalScrollIndicator={false} style={{marginVertical: 5, marginBottom: 50}}>

                    <FlatList data={images} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
                              showsHorizontalScrollIndicator={false}/>

                    <AddressContainer>
                        <Icon name={'home'} type={'ionicon'} size={25} style={{marginRight: 5}} color={Colors.buttonPrimary}/>
                        <TextComponent semiLarge bold style={{ flex:1,
                            flexWrap: 'wrap'}}>
                            {listingsData.address}
                        </TextComponent>
                    </AddressContainer>

                    <LocationContainer>
                        <Icon name={'location'} type={'ionicon'} size={15} style={{marginRight: 5}} color={'rgba(0,0,0, 0.9)'}/>
                        <TextComponent color={'rgba(0,0,0, 0.9)'}>
                            {location.city === location.county ? location.city : `${location.city}, ${location.county}`},
                            <TextComponent tiny color={'rgba(0,0,0, 0.6)'}> {location.state}, {location.country}</TextComponent>
                        </TextComponent>

                    </LocationContainer>

                    <RoomsContainer>

                        <IconsAndRoomNumbers>
                            <View style={{backgroundColor: 'grey', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 50}}>
                                <TextComponent bold color={'white'}>{roomNumbers.bedRoom}</TextComponent>
                            </View>
                            <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                                <TextComponent> Bed Room</TextComponent>
                            </View>

                        </IconsAndRoomNumbers>

                        <IconsAndRoomNumbers>
                            <View style={{backgroundColor: 'grey', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 50}}>
                                <TextComponent bold color={'white'}>{roomNumbers.dinning}</TextComponent>
                            </View>
                            <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                                <TextComponent> Dinning</TextComponent>
                            </View>
                        </IconsAndRoomNumbers>

                        <IconsAndRoomNumbers>
                            <View style={{backgroundColor: 'grey', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 50}}>
                                <TextComponent bold color={'white'}>{roomNumbers.washRoom}</TextComponent>
                            </View>
                            <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                                <TextComponent> Washroom</TextComponent>
                            </View>
                        </IconsAndRoomNumbers>

                    </RoomsContainer>

                    { facilities.hasBalcony || facilities.isFireSafety || facilities.hasCCTV || facilities.isNearToMainRoad ?
                        <FacilitiesContainer horizontal showsHorizontalScrollIndicator={false} centerContent>
                            {facilities.hasBalcony ?
                                <Facilities>
                                    <TextComponent bold color={'white'}>Balcony</TextComponent>
                                </Facilities>: null }

                            {facilities.hasCCTV ?
                                <Facilities>
                                    <TextComponent bold color={'white'}>CCTV</TextComponent>
                                </Facilities>: null }
                            {facilities.isFireSafety ?
                                <Facilities>
                                    <TextComponent bold color={'white'}>Fire Safety</TextComponent>
                                </Facilities>: null }

                            {facilities.isNearToMainRoad ?
                                <Facilities>
                                    <TextComponent bold color={'white'}>Near to Main Road</TextComponent>
                                </Facilities>: null }



                        </FacilitiesContainer> : null
                    }

                    <RentAndNegotiableContainer>
                        <TextComponent bold semiLarge color={'white'}>RENT/MONTH </TextComponent>

                        <ContainerFlexRow>
                            { rentPerMonth ?
                                <RentContainer>
                                    <TextComponent bold color={'white'}>{rentPerMonth}TK</TextComponent>

                                </RentContainer> : null
                            }

                            { isNegotiable ?
                                <RentContainer>
                                    <TextComponent bold color={'white'}>Negotiable</TextComponent>

                                </RentContainer> : null
                            }

                        </ContainerFlexRow>

                    </RentAndNegotiableContainer>

                    <RentAvailableFor>
                        { forFamily ?
                            <RentType >
                                <TextComponent medium bold color={'white'}>FAMILY</TextComponent>
                            </RentType> : null
                        }

                        { forBachelor ?
                            <RentType>
                                <TextComponent medium bold color={'white'}>BACHELOR</TextComponent>
                            </RentType> : null
                        }


                    </RentAvailableFor>

                    <MoreDetailsContainer>
                        <TextComponent semiLarge bold>MORE DETAILS</TextComponent>

                        <ListingDetails>
                            <TextComponent medium selectable={true}>{moreDetails}</TextComponent>
                        </ListingDetails>

                    </MoreDetailsContainer>


                </ScrollView>

                { currentUserListings ?
                    <EditListingButton onPress={() => setListingUpdateModal(true)}>
                        <Icon name={'mode-edit'} type={'md'} size={25} style={{marginRight: 5}} color={'white'}/>
                        <TextComponent bold medium color={'white'}>EDIT LISTING</TextComponent>
                    </EditListingButton>
                    :
                    <ContactAndMessageContainer>
                        <ContactContainer onPress={()=>makeCall(postedUserInfo.phoneNumber)}>
                            <Icon name={'call'} type={'ionicon'} size={25} style={{marginRight: 5}} color={'white'}/>
                            <TextComponent bold medium color={'white'}>CONTACT WITH LANDLORD</TextComponent>
                        </ContactContainer>
                        <Icon name={'chatbubble-ellipses-outline'} type={'ionicon'} size={25} style={{marginRight: 5}} color={'white'}
                              onPress={() => isSendMessageOrGoMessageScreen()}/>
                    </ContactAndMessageContainer>

                }

                <RBSheet
                    ref={SendMessageBottomSheet}
                    closeOnDragDown={true}
                    closeOnPressMask={true}
                    dragFromTopOnly={true}
                    height={130}

                    customStyles={{
                        wrapper: {
                            backgroundColor: "transparent"
                        },
                        container: style.sheetContainer,

                    }}
                >
                    <MessageAndButtonContainer>
                        <SendMessageBox placeholder={'Send your Message'} placeholderTextColor={'grey'}
                        defaultValue={message}
                                        onChangeText={(message) => setMessage(message)}
                        />
                        { sendingMessage ?  <ActivityIndicator size={'small'} color={'white'}/>
                            :
                            <Icon name={'send'} type={'md'} size={35} style={{marginLeft: 5}} color={'white'} onPress={() => SendMessageToLandlord()}/>
                        }


                    </MessageAndButtonContainer>

                </RBSheet>



            </ModalView>
            <ListingsUpdateModal modalVisible={openListingUpdateModal} modalHide={closeListingUpdateModal}
                                 listingsData={listingData}
            />
        </Container>
    );
};

const renderImage= (image) => {

    return(
        <View style={{marginHorizontal:15}}>
            <Image source={{uri: image.imageUrl}} style={{ height: 250, width: 250, borderRadius: 10}}  PlaceholderContent={<ActivityIndicator size="large" color={'white'}/>}/>

        </View>
    )

};

const ListingsImagesContainer = styled.Image`
height: 250px;
width: 250px;
borderRadius: 10px;

`;

const StatusBarAndTopHeaderBGColor = Colors.primaryStatusbarColor;
const Container = styled.SafeAreaView`

`;


const AddressContainer = styled.View`
marginTop: 10px;
  flexDirection: row;
   alignItems: center;
   marginHorizontal: 10px;

`;

const LocationContainer = styled.View`
flexDirection: row;
   alignItems: center;
   marginHorizontal: 10px;
   marginBottom: 20px;
`

const ModalView = styled.View`
backgroundColor: white;
height:100%;

`;

const ModalHeader = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};
 flexDirection: row;
 width: 100%
 alignItems: center;
 paddingHorizontal: 20px;
 paddingVertical: 12px;
 justifyContent: space-between;

`;

const RoomsContainer = styled.View`
alignItems: center;
justifyContent: space-between;
flexDirection: row;
marginHorizontal: 10px;

`

const IconsAndRoomNumbers = styled.View`
alignItems: center;
flexDirection: row;
backgroundColor: white;
borderWidth: 1px;

borderColor: rgba(0, 0, 0, 0.1);
borderRadius: 50px;

`;

const FacilitiesContainer = styled.ScrollView`
marginVertical: 30px;
flexDirection: row;
marginHorizontal: 10px;

`;

const Facilities = styled.View`
backgroundColor: #632b9b;
paddingHorizontal: 10px;
paddingVertical: 5px;
borderRadius: 15px;
marginHorizontal: 5px;


`;

const RentAndNegotiableContainer = styled.View`
marginHorizontal: 10px;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal: 10px;
backgroundColor: #d80499;
paddingVertical: 10px;
marginBottom: 10px;
borderRadius: 5px;


`;

const RentContainer = styled.View`
backgroundColor: #d80499;
paddingHorizontal: 10px;
paddingVertical: 10px;
borderRadius: 20px;
marginHorizontal: 5px;
borderColor: white;
borderWidth: 2px;

`;

const ContactAndMessageContainer = styled.View`
position: absolute;
 bottom:0;
 flexDirection:row;
 borderTopLeftRadius: 10px;
 borderTopRightRadius: 10px;
 paddingVertical: 15px;
 width:100%;
 alignItems: center;
 justifyContent: space-between;
 paddingHorizontal: 20px;
   backgroundColor: red;
`

const ContactContainer = styled.Pressable`

 flexDirection: row;
 alignItems: center;
`;

const EditListingButton = styled.TouchableOpacity`
position: absolute;
 bottom:0;
 alignSelf: center;
 borderTopLeftRadius: 10px;
 borderTopRightRadius: 10px;
 paddingVertical: 15px;
  width:100%;
 justifyContent: center;
  flexDirection: row;
  alignItems: center;
 paddingHorizontal: 20px;
  backgroundColor: red;
`

const ContainerFlexRow = styled.View`
flexDirection: row;
alignItems: center;
`;

const RentAvailableFor = styled.View`
alignItems:center;
flexDirection: row;
marginVertical: 20px;
 justifyContent: center;
`;

const RentType = styled.View`
marginRight: 10px;
backgroundColor: #9c45c1;
 paddingVertical: 10px;
 paddingHorizontal: 20px;
  borderRadius: 30px;


`;

const MoreDetailsContainer = styled.View`


`

const ListingDetails = styled.View`
marginTop: 10px;
backgroundColor: lavender;
paddingHorizontal: 5px;
paddingVertical: 5px;
borderRadius: 5px;

`;

const MessageAndButtonContainer = styled.View`
marginVertical: 15px;
paddingHorizontal: 10px;
flexDirection: row;
alignItems: center;
marginHorizontal: 5px;
borderRadius: 50px;
backgroundColor: ${Colors.primaryBodyLight};
justifyContent: space-between;
`;

const SendMessageBox = styled.TextInput`
borderWidth: 1px;
borderColor: lavender;
borderRadius: 50px;
color: white;
backgroundColor: ${Colors.primaryBody};
paddingHorizontal: 10px;
width: 88%;
fontSize: 18px;
`;

const style = StyleSheet.create({
    sheetContainer : {
        backgroundColor: Colors.primaryBody,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowRadius: 5,
        elevation:10,
        shadowOpacity: 1

    },
    pressable: {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        overflow: 'hidden',

    }
});
