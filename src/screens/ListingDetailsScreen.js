import React, {useEffect, useRef, useState, useContext} from "react";
import {
    View,
    ScrollView,
    FlatList,
    Linking,
    ActivityIndicator,
    StyleSheet,
    ToastAndroid,
    Vibration
} from "react-native";
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {Icon, Image} from "react-native-elements";
import {ListingsUpdateModal} from "../modals/ListingsUpdateModal";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";
import firestore from "@react-native-firebase/firestore";
import RBSheet from "react-native-raw-bottom-sheet";
import {FirebaseContext} from "../context/FirebaseContext";
import {v4 as uuidv4} from "uuid";
import {Avatar, FAB} from "react-native-paper";
import {UserContext} from "../context/UserContext";
import {ListingDeleteConfirmModal} from "../modals/ListingDeleteConfirmModal";
import LottieView from "lottie-react-native";
import moment from "moment";


export const ListingDetailsScreen = (props) => {
    const firebase = useContext(FirebaseContext);
    const {route, navigation} = props;
    const {params} = route;
    const currentUserId = firebase.getCurrentUser().uid;

    const {listingId, listingsData, postedUserInfo, currentUserListings} = params;
    const [listingData, setListingData] = useState(listingsData);
    const [listingOwnerInfo, setListingOwnerInfo] = useState(postedUserInfo);
    const [user] = useContext(UserContext);

    useEffect(() => {

        const subscriber = firestore().collection('listings').doc(listingId).onSnapshot(
            doc=> {
                if(doc) setListingData(doc.data());
            });

        const userSubscriber = firestore().collection('users').doc(postedUserInfo.id).onSnapshot(doc => {
            if(doc) setListingOwnerInfo(doc.data());
        });

        return () => subscriber() || userSubscriber();


    }, []);

    const {images, roomNumbers, facilities, forBachelor, forFamily, userId , usersInFav, address, rentPerMonth, isNegotiable, moreDetails, location, interestedTenantId} = listingData;

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
            const messageId = uuidv4();
            await firebase.sendMessage(postedUserId, currentUserId, message, [], listingId, messageId);
            await firebase.createNotification(postedUserId, currentUserId, false, messageId, listingId, message);


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

    const [openSpeedDial, setSpeedDial] = useState(false);

    const isCurrentUserFavList = usersInFav?.includes(currentUserId) ?? false;
    const addRemoveFavorite = async (listingId) => {
        Vibration.vibrate(20);

        try{
            if(isCurrentUserFavList){
                const updateType= 'REMOVE'

                await firebase.updateFavoriteListing(listingId, currentUserId, updateType);
                ToastAndroid.show('Removed from favorite', ToastAndroid.LONG);

            }
            else {
                await firebase.updateFavoriteListing(listingId, currentUserId);
                ToastAndroid.show('Added as favorite', ToastAndroid.LONG);
            }
        } catch (e) {
            alert(e.message);

        }
    };

    const LastSeen = (time) => {
        const getDayDifference =  Math.round((new Date().getTime() - new Date(time).getTime())/(1000*3600*24));
        return(
            <TextComponent extraTiny color={'white'} style={{ marginLeft: 3}}>
                Last seen @ {getDayDifference > 0 ? moment(time).calendar() : moment(time).startOf('minutes').fromNow()}
            </TextComponent>
        )
    };


    //open Delete Confirm Modal
    const [openDeleteConfirmModal, setDeleteConfirmModal] = useState(false);

    if(listingOwnerInfo && listingData){
        return (
            <Container>
                <FocusedStatusbar barStyle="light-content" backgroundColor={StatusBarAndTopHeaderBGColor}/>
                <ModalHeader>
                    <Icon name={'chevron-back-outline'} type={'ionicon'} size={35} color={'white'} onPress={() => navigation.goBack()}/>
                    { currentUserId !== userId ?
                        <Icon name={isCurrentUserFavList ? 'heart' : 'heart-outline'} type={'ionicon'} size={35}
                              style={{marginRight: 5}} color={isCurrentUserFavList ? '#b716af' : 'white'}
                              onPress={() => addRemoveFavorite(listingId)}/> : null
                    }
                    <TextComponent bold medium color={'white'}>LISTING DETAILS</TextComponent>
                </ModalHeader>

                <BodyView>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        <FlatList data={images} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
                                  ListEmptyComponent={
                                      <View style={{flexDirection: 'row'}}>
                                          <ListingsImagesContainer/>
                                          <ListingsImagesContainer/>
                                          <ListingsImagesContainer/>
                                          <ListingsImagesContainer/>
                                      </View>}
                                  style={{marginTop: 5}}
                                  showsHorizontalScrollIndicator={false}/>


                        <AddressContainer>
                            <Icon name={'home'} type={'ionicon'} size={20} style={{marginRight: 5}} color={Colors.buttonPrimary}/>
                            <TextComponent medium bold style={{ flex:1,
                                flexWrap: 'wrap'}}>
                                {address}
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
                                    <TextComponent bold color={'white'}>{roomNumbers.dining}</TextComponent>
                                </View>
                                <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
                                    <TextComponent> Dining</TextComponent>
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
                                <TenantType >
                                    <TextComponent medium bold color={'white'}>FAMILY</TextComponent>
                                </TenantType> : null
                            }

                            { forBachelor ?
                                <TenantType>
                                    <TextComponent medium bold color={'white'}>BACHELOR</TextComponent>
                                </TenantType> : null
                            }


                        </RentAvailableFor>

                        <MoreDetailsContainer>
                            <TextComponent semiLarge bold>MORE DETAILS</TextComponent>

                            <ListingDetails>
                                <TextComponent medium selectable={true}>{moreDetails}</TextComponent>
                            </ListingDetails>

                        </MoreDetailsContainer>

                    </ScrollView>

                    <PostedBy>
                        <View>
                            <Avatar.Image size={35} source={{uri: listingOwnerInfo?.profilePhotoUrl}}/>
                            { listingOwnerInfo?.isOnline ?
                                <View style={{position: 'absolute', top: -2, right: 0, backgroundColor: Colors.primaryBody,
                                    borderColor: Colors.primaryBody, borderRadius: 6, borderWidth: 2, height: 12, width: 12}}>

                                    <View style={{backgroundColor: Colors.onlineStatusDotColor, height: 8, width: 8, borderRadius: 4}}/>
                                </View> : null
                            }
                        </View>
                        <View style={{marginHorizontal: 5}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TextComponent medium color={'white'}>{listingOwnerInfo.userName}</TextComponent>
                                {currentUserListings ? <Icon name={'home'} color={Colors.appIconColor} type={'ionicon'} size={13} style={{marginLeft: 2}}/> : null}

                            </View>
                            {listingOwnerInfo.isOnline ?
                                <TextComponent tiny color={'white'}>Online</TextComponent> :
                                !listingOwnerInfo?.isOnline && listingOwnerInfo.lastSeen ?
                                    LastSeen(listingOwnerInfo.lastSeen) : null

                            }

                        </View>


                    </PostedBy>


                    { currentUserListings ?

                        <FAB.Group
                            fabStyle={{backgroundColor: Colors.buttonPrimary}}
                            open={openSpeedDial}
                            icon={openSpeedDial ? 'close' : 'home-edit'}
                            actions={[
                                // {
                                //     icon: 'delete',
                                //     label: 'Delete Listing',
                                //     style: {backgroundColor: 'red'},
                                //     onPress: () => {
                                //         Vibration.vibrate(30);
                                //         setDeleteConfirmModal(true)}
                                // },
                                {
                                    icon: 'home-edit',
                                    label: 'Edit Listing',
                                    style: {backgroundColor: Colors.buttonPrimary},
                                    onPress: () => setListingUpdateModal(true),
                                }
                            ]}
                            onStateChange={() =>
                                setSpeedDial(!openSpeedDial)}
                        />
                        : user.userType === 'tenant' ?
                            <FAB.Group
                                fabStyle={{backgroundColor: Colors.buttonPrimary}}
                                open={openSpeedDial}
                                icon={openSpeedDial ? 'close' : 'phone'}
                                actions={[
                                    {
                                        icon: 'phone',
                                        label: 'Call Landlord',
                                        style: {backgroundColor: Colors.buttonPrimary},
                                        onPress: () => makeCall(listingOwnerInfo.phoneNumber),
                                    },
                                    {
                                        icon: 'chat',
                                        label: isCurrentUserInterested ? 'Go to Messages' :'Message Landlord',
                                        style: {backgroundColor: Colors.buttonPrimary},
                                        onPress: () => isSendMessageOrGoMessageScreen(),
                                    }
                                ]}
                                onStateChange={() => setSpeedDial(!openSpeedDial)}
                            /> : null
                        // <ContactAndMessageContainer>
                        //     <ContactContainer onPress={()=>makeCall(postedUserInfo.phoneNumber)}>
                        //         <Icon name={'call'} type={'ionicon'} size={25} style={{marginRight: 5}} color={'white'}/>
                        //         <TextComponent bold medium color={'white'}>CONTACT WITH LANDLORD</TextComponent>
                        //     </ContactContainer>
                        //     <Icon name={'chatbubble-ellipses-outline'} type={'ionicon'} size={25} style={{marginRight: 5}} color={'white'}
                        //           onPress={() => isSendMessageOrGoMessageScreen()}/>
                        // </ContactAndMessageContainer>

                    }


                    <RBSheet
                        ref={SendMessageBottomSheet}
                        closeOnDragDown={true}
                        closeOnPressMask={true}
                        dragFromTopOnly={true}
                        height={105}

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
                            { sendingMessage ?  <ActivityIndicator size={'large'} color={'white'}/>
                                :
                                <Icon name={'send'} type={'md'} size={35} style={{marginLeft: 5}} color={'white'} onPress={() => SendMessageToLandlord()}/>
                            }


                        </MessageAndButtonContainer>

                    </RBSheet>



                </BodyView>
                <ListingsUpdateModal modalVisible={openListingUpdateModal} modalHide={closeListingUpdateModal}
                                     listingsData={listingData}
                />
                {/*<ListingDeleteConfirmModal modalVisible={openDeleteConfirmModal} actionProps={{itemId: listingId, images: images}} navigation={navigation}*/}
                {/*                           modalHide={setDeleteConfirmModal} listingName={address}/>*/}
            </Container>
        );
    } else{
        return(
            <Container>
                <FocusedStatusbar barStyle="light-content" backgroundColor={StatusBarAndTopHeaderBGColor}/>
                <ModalHeader>
                    <Icon name={'chevron-back-outline'} type={'ionicon'} size={35} color={'white'} onPress={() => navigation.goBack()}/>

                    <TextComponent bold medium color={'white'}>LISTING DETAILS</TextComponent>
                </ModalHeader>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <LottieView source={require('../../assets/lottie-animations/sad-listing-not-found.json')} autoPlay loop style={{width: 120}} />
                    <TextComponent medium center bold>Listing not found</TextComponent>
                </View>

            </Container>
        )

    }
};

const renderImage= (image) => {

    return(
        <View style={{marginHorizontal:10}}>
            <Image source={{uri: image.imageUrl}} style={{ height: 250, width: 250, borderRadius: 10}}  PlaceholderContent={<ActivityIndicator size="large" color={'white'}/>}/>
        </View>
    )

};

const StatusBarAndTopHeaderBGColor = Colors.primaryStatusbarColor;
const Container = styled.SafeAreaView`
flex:1

`;


const AddressContainer = styled.View`
marginTop: 10px;
  flexDirection: row;
   alignItems: center;
   marginHorizontal: 5px;

`;

const LocationContainer = styled.View`
flexDirection: row;
   alignItems: center;
   marginHorizontal: 5px;
   marginBottom: 10px;
`

const BodyView = styled.View`
backgroundColor: white;
flex:1
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
marginVertical: 10px;
justifyContent: space-between;
flexDirection: row;
marginHorizontal: 5px;

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
marginVertical: 15px;
flexDirection: row;
marginHorizontal: 5px;

`;

const Facilities = styled.View`
backgroundColor: #632b9b;
paddingHorizontal: 10px;
paddingVertical: 5px;
borderRadius: 15px;
marginHorizontal: 5px;


`;

const RentAndNegotiableContainer = styled.View`
marginHorizontal: 5px;
marginVertical: 10px;
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
marginVertical: 10px;
 justifyContent: center;
`;

const TenantType = styled.View`
marginRight: 10px;
backgroundColor: #9c45c1;
paddingVertical: 10px;
paddingHorizontal: 20px;
borderRadius: 30px;


`;

const MoreDetailsContainer = styled.View`
paddingHorizontal: 5px;

`

const ListingDetails = styled.View`
marginTop: 5px;
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

const PostedBy = styled.View`
flexDirection: row;
alignItems: center;
backgroundColor: ${Colors.primaryBody};
paddingHorizontal: 10px;

paddingVertical: 5px;

`;

const ListingsImagesContainer = styled.View`
height:250px;
width:250px;
backgroundColor: #d8d4d4;
borderRadius: 10px;
marginHorizontal: 10px;
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
