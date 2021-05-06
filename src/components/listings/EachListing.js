import React, {useContext, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, View, StyleSheet, ToastAndroid, Dimensions, Animated, Vibration} from 'react-native';
import {Divider, Icon, Image} from "react-native-elements";
import {TextComponent} from "../TextComponent";
import styled from "styled-components";
import moment from "moment";
import firestore from "@react-native-firebase/firestore";
import {FirebaseContext} from "../../context/FirebaseContext";
import {Avatar} from "react-native-paper";
import {Colors} from "../utilities/Colors";
import RBSheet from "react-native-raw-bottom-sheet";
import {ListingsUpdateModal} from "../../modals/ListingsUpdateModal";


export const EachListing = (props) => {
    const ListingsBottomSheet = useRef();

    const firebase = useContext(FirebaseContext);
    const {item} = props;
    const {images, roomNumbers, forFamily, forBachelor, usersInFav, moreDetails, location, rentPerMonth, interestedTenantId} = item;
    const [postedUser, setPostedUser] = useState('');
    const currentUserId = firebase.getCurrentUser().uid;


    //for modals
    const [openListingDetailsModal, setListingDetailsModal] = useState(false);
    const closeListingDetailsModal  = () => {
        setListingDetailsModal(false);
    }


    const postedTime = () => {
        const postedTime = new Date(item.postedTime.seconds * 1000),
            todayDate = new Date(),
            getDayDifference =  Math.round((todayDate.getTime() - postedTime.getTime())/(1000*3600*24));
        if(getDayDifference > 25) return moment(postedTime).format('dddd, Do MMM YYYY');
        else if(getDayDifference < 7 ){
            if(getDayDifference < 1)  return moment(postedTime).startOf('minutes').fromNow();
            else return moment(postedTime).calendar();
        } else return moment(postedTime).startOf('minutes').fromNow();


    }

    useEffect(() => {
        const subscriber = firestore().collection('users').doc(item.userId).onSnapshot(
            doc=> {
                if(doc) setPostedUser(doc.data());
            });

        return () => subscriber();
    },[]);

    const getFirstNameFromPostedUser = () => {

        if(item.userId === currentUserId){
            return 'Myself';
        }
        else {
            const nameAsArray = postedUser ? postedUser.userName.split(' ') : null;
            return postedUser ? nameAsArray[0] : null;
        }
    }

    const currentUserListings = () => {
        return item.userId === currentUserId;

    };

    //remove listing
    const removeListing = async (id, images) => {
        // console.log('ok remove');
        Vibration.vibrate(30);
        try {
            await firebase.removeListing(id, images);
            ToastAndroid.show('Listing Deleted', ToastAndroid.LONG);
        } catch (error){
            alert(error.message);
        }finally {
            CloseBottomSheet();
        }

    };

    //add favorite

    const addRemoveFavorite = async (listingId) => {
        Vibration.vibrate(20);

        try{
            const isCurrentUserFavList = usersInFav ? usersInFav.find(userId => userId === currentUserId) : null;
            if(currentUserId === isCurrentUserFavList){
                const updateType= 'REMOVE'

                await firebase.updateFavoriteListing(listingId, currentUserId, updateType);

            }
            else await firebase.updateFavoriteListing(listingId, currentUserId);
        } catch (e) {
            alert(e.message);

        }
    }


    const isCurrentUserFavList = usersInFav ? usersInFav.includes(currentUserId) : false;

    // onPress={() => removeListing(item.id, images)}

    //open update modal

    //Bottom Sheet Actions
    const [deleteListingInfo, setDeleteListingInfo] = useState(null);
    const [EditListingInfo, setEditListingInfo] = useState(item);

    const OpenBottomSheet = (item) => {
        Vibration.vibrate(20);
        setDeleteListingInfo({
            listingId: item.id,
            listingImages: item.images
        });
        setEditListingInfo(item);
        ListingsBottomSheet.current.open();

    }

    const CloseBottomSheet = () => {
        setDeleteListingInfo(null);
        ListingsBottomSheet.current.close();
    }

    //update Modal
    const [openListingUpdateModal, setListingUpdateModal] = useState(false);

    const closeListingUpdateModal = () => {
        setListingUpdateModal(false);
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const windowWidth = Dimensions.get('window').width;


    const fadeIn = () => {
        // Will change fadeAnim value to 1 in 5 seconds
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        // Will change fadeAnim value to 0 in 5 seconds
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
        }).start();
    };




    return (
        <CardsContainer>

            <TimeContainer>

                { currentUserListings() ?

                    <View style={{alignItems: "center", flexDirection: 'row'}}>
                        <Avatar.Image size={20} source={{uri: postedUser?.profilePhotoUrl}}/>

                        <TextComponent style={{marginLeft: 2}}>{getFirstNameFromPostedUser()}</TextComponent>
                    </View>
                    :
                    <Icon name={isCurrentUserFavList ? 'heart' : 'heart-outline'} type={'ionicon'} size={25}
                          style={{marginRight: 5}} color={isCurrentUserFavList ? '#b716af' : 'grey'}
                          onPress={() => addRemoveFavorite(item.id)}/>
                }

                <View style={{alignItems: "center", flexDirection: 'row'}}>
                    <Icon name={'time-outline'} type={'ionicon'} size={15} style={{marginRight: 1}}/>
                    <TextComponent small>{postedTime()}</TextComponent>

                </View>

                { currentUserListings() ?
                    <Icon name={'more-horiz'} type={'md'} size={20}
                          style={{marginRight: 5}} color={'grey'} onPress={() => OpenBottomSheet(item)}/>

                    :

                    <View style={{alignItems: "center", flexDirection: 'row'}}>
                        <Avatar.Image size={20} source={{uri: postedUser?.profilePhotoUrl}}/>
                        <TextComponent style={{marginLeft: 2}}>{getFirstNameFromPostedUser()}</TextComponent>
                    </View>
                }



            </TimeContainer>


            { images?.length !== 0 ?
                <FlatList data={images} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
                          showsHorizontalScrollIndicator={false}/> :
                <View style={{flexDirection: 'row'}}>
                    <ListingsImagesContainer/>
                    <ListingsImagesContainer/>
                    <ListingsImagesContainer/>
                </View>

            }

            <AddressContainer>
                <Icon name={'home'} type={'ionicon'} size={20} style={{marginRight: 5}} color={Colors.buttonPrimary}/>
                <TextComponent style={{ flex:1,
                    flexWrap: 'wrap'}} medium ellipsizeMode={'tail'} numberOfLines={2}>{item.address}</TextComponent>

            </AddressContainer>


            <LocationAndRentContainer>
                <Location>
                    <Icon name={'location'} type={'ionicon'} size={15} style={{marginRight: 5}} color={'rgba(0,0,0, 0.9)'}/>
                    <TextComponent color={'rgba(0,0,0, 0.9)'}>
                        {location?.city === location?.county ? location.city : `${location.city}, ${location.county}`},
                        <TextComponent tiny color={'rgba(0,0,0, 0.6)'}> {location?.state}, {location?.country}</TextComponent>
                    </TextComponent>

                </Location>
                <View style={{backgroundColor: '#06D6A0', paddingHorizontal: 5, paddingVertical: 5, borderRadius:50}}>
                    <TextComponent color={'white'} bold>TK. {rentPerMonth}</TextComponent>

                </View>


            </LocationAndRentContainer>


            <HomeItemsNumbersContainer>
                <HomeItemsNumbers>
                    <Icon name={'bed'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>{roomNumbers.bedRoom}</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'restaurant'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>{roomNumbers.dining}</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'toilet'} type={'font-awesome-5'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>{roomNumbers.washRoom}</TextComponent>
                </HomeItemsNumbers>

                <RentType>
                    {
                        forFamily && forBachelor ? <TextComponent color={'white'} bold tiny>Bachelor/Family</TextComponent>
                            : forBachelor ? <TextComponent color={'white'} tiny bold>BACHELOR</TextComponent>
                            : forFamily ? <TextComponent color={'white'} bold tiny>FAMILY</TextComponent> : null


                    }
                </RentType>

                <Icon name={'chevron-forward-circle'} type={'ionicon'} size={35} style={{marginRight: 5}} color={'grey'}
                      onPress={() => props.navigation.navigate('ListingDetails', {
                          listingId: item.id,
                          listingsData: item,
                          postedUserInfo: postedUser,
                          currentUserListings: currentUserListings()
                      })}/>

            </HomeItemsNumbersContainer>

            <RBSheet
                ref={ListingsBottomSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                dragFromTopOnly={true}
                height={110}

                customStyles={{
                    wrapper: {
                        backgroundColor: "transparent"
                    },
                    container: style.sheetContainer,

                }}
            >

                <View style={{overflow: "hidden"}}>
                    <Animated.View style={ [{scaleX: fadeAnim}, {backgroundColor: 'red',width: windowWidth, height: 45, position: "absolute"}]} ref={fadeAnim}/>
                    <DeleteContainer onLongPress={() => removeListing(deleteListingInfo.listingId, deleteListingInfo.listingImages)} delayLongPress={3000}
                                     onPressIn={() => fadeIn()} onPressOut={() => fadeOut()}>
                        <Icon name={'trash'} color={'red'} type={'ionicon'} size={15} style={{marginRight: 10}}/>
                        <TextComponent  medium color={'white'}>DELETE </TextComponent>
                    </DeleteContainer>
                </View>


                <Divider backgroundColor={'grey'}/>


                <EditContainer onPress={() => {setListingUpdateModal(true); CloseBottomSheet();}}>
                    <Icon name={'edit'} color={'white'} type={'md'} size={15} style={{marginRight: 10}}/>
                    <TextComponent  medium color={'white'}>EDIT </TextComponent>
                </EditContainer>
            </RBSheet>

            <ListingsUpdateModal modalVisible={openListingUpdateModal} modalHide={closeListingUpdateModal}
                                 listingsData={EditListingInfo}
            />
        </CardsContainer>

    )
}

const renderImage= (image) => {

    return(
        <View style={{marginHorizontal:10}}>
            <Image source={{uri: image.imageUrl}} style={{ height: 150, width: 150, borderRadius: 10}}  PlaceholderContent={<ActivityIndicator size="large" color="white"/>}/>

        </View>
    )

};


const ListingsImagesContainer = styled.View`
height:150px;
width:150px;
backgroundColor: #d8d4d4;
borderRadius: 10px;
marginHorizontal: 10px;

`;

const CardsContainer = styled.View`
 marginVertical:10px;
  backgroundColor: white;
   paddingHorizontal: 10px;
   paddingVertical: 5px;
    
     overflow: hidden;
     elevation: 5;
         shadowColor: #000;
          shadowOpacity: 1;
                    shadowRadius: 5.32px;
     
`;

const TimeContainer = styled.View`
flexDirection : row;
alignItems: center;
paddingBottom: 5px;
justifyContent: space-between;


`;


const LocationAndRentContainer = styled.View`
flexDirection : row;
alignItems: center;
justifyContent: space-between;
marginRight: 10px;
overflow: hidden;

`;

const Location = styled.View`
flexDirection: row;
 alignItems: center;
 width: 70%;

`;

const AddressContainer = styled.View`
flexDirection : row;
alignItems: center;
marginRight: 10px;
overflow: hidden;
maxHeight: 60px;
paddingVertical: 5px;

`;


const HomeItemsNumbers = styled.View`
flexDirection : row;
alignItems: center;
`

const HomeItemsNumbersContainer = styled.View`
flexDirection : row;
alignItems: center;
paddingTop: 5px
justifyContent: space-between;
`;

const PostedUserAvatar = styled.Image`
height: 20px;
width: 20px;
borderRadius: 10px;
`;

const RentType = styled.View`
backgroundColor: #9c45c1;
paddingVertical: 5px;
paddingHorizontal: 5px;
borderRadius: 20px;
`;

const DeleteContainer = styled.Pressable`
display: flex;
flexDirection: row;
paddingHorizontal: 20px; 
paddingVertical: 10px;
alignItems: center;


`;

const EditContainer = styled.Pressable`
display: flex;
flexDirection: row;
paddingHorizontal: 20px; 
paddingVertical: 10px;
alignItems: center;
overflow: hidden


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
