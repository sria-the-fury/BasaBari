import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import {Icon, Image} from "react-native-elements";
import {TextComponent} from "../TextComponent";
import styled from "styled-components";
import moment from "moment";
import firestore from "@react-native-firebase/firestore";
import {FirebaseContext} from "../../context/FirebaseContext";
import {Avatar} from "react-native-paper";



export const EachListing = (props) => {
    const firebase = useContext(FirebaseContext);
    const {item} = props;
    const {images, roomNumbers, forFamily, forBachelor, usersInFav, moreDetails} = item;
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
                setPostedUser(doc.data());
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
        try {
            await firebase.removeListing(id, images);
        } catch (error){
            alert(error.message);
        }

    };

    //add favorite

    const addRemoveFavorite = async (listingId) => {

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



    return (
        <CardsContainer>

            <TimeContainer>

                { currentUserListings() ?

                    <View style={{alignItems: "center", flexDirection: 'row'}}>
                        <Avatar.Image size={20} source={{uri: postedUser?.profilePhotoUrl}}/>

                        <TextComponent style={{marginLeft: 2}}>{getFirstNameFromPostedUser()}</TextComponent>
                    </View>
                    :
                    <Icon name={'heart'} type={'ionicon'} size={25}
                          style={{marginRight: 5}} color={isCurrentUserFavList ? '#b716af' : 'grey'}
                          onPress={() => addRemoveFavorite(item.id)}/>
                }

                <View style={{alignItems: "center", flexDirection: 'row'}}>
                    <Icon name={'time-outline'} type={'ionicon'} size={15} style={{marginRight: 1}}/>
                    <TextComponent small>{postedTime()}</TextComponent>

                </View>

                { currentUserListings() ?
                    // <Icon name={'more-vert'} type={'md'} size={20}
                    //       style={{marginRight: 5}} color={'grey'} onPress={() => ListingActions(item)}/>
                    <Icon name={'trash'} type={'ionicon'} size={20}
                          style={{marginRight: 5}} color={'red'} onPress={() => removeListing(item.id, images)}/>

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


            <LocationContainer>
                <Icon name={'navigate'} type={'ionicon'} size={18} style={{marginRight: 5}} color={'blue'}/>
                <TextComponent style={{ flex:1,
                    flexWrap: 'wrap'}} semiLarge ellipsizeMode={'tail'}>{item.address}</TextComponent>

            </LocationContainer>


            <HomeItemsNumbersContainer>
                <HomeItemsNumbers>
                    <Icon name={'bed'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>{roomNumbers.bedRoom}</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'toilet'} type={'font-awesome-5'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>{roomNumbers.washRoom}</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'restaurant'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>{roomNumbers.dinning}</TextComponent>
                </HomeItemsNumbers>

                <RentType>
                    {
                        forFamily && forBachelor ? <TextComponent color={'white'} bold tiny>Bachelor/Family</TextComponent>
                            : forBachelor ? <TextComponent color={'white'} tiny bold>BACHELOR</TextComponent>
                            : <TextComponent color={'white'} bold tiny>FAMILY</TextComponent>


                    }
                </RentType>

                <Icon name={'chevron-forward-circle'} type={'ionicon'} size={35} style={{marginRight: 5}} color={'grey'}
                      onPress={() => props.navigation.navigate('ListingDetails', {
                          listingsData: item,
                          postedUserInfo: postedUser,
                          currentUserListings: currentUserListings()
                      })}/>

            </HomeItemsNumbersContainer>

        </CardsContainer>

    )
}

const renderImage= (image) => {

    return(
        <View style={{marginHorizontal:10}}>
            <Image source={{uri: image.imageUrl}} style={{ height: 150, width: 150, borderRadius: 10}}  PlaceholderContent={<ActivityIndicator/>}
                   placeholderStyle={{color: 'cyan', alignSelf: 'center'}}/>

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

marginHorizontal:10px;
 marginVertical:10px;
  backgroundColor: white;
   paddingHorizontal: 10px;
    paddingVertical:10px;
     borderRadius:10px;
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


const LocationContainer = styled.View`
flexDirection : row;
alignItems: center;
marginRight: 10px;
overflow: hidden

paddingTop: 10px

`;


const HomeItemsNumbers = styled.View`
flexDirection : row;
alignItems: center;
paddingBottom: 5px;
paddingTop: 5px
`

const HomeItemsNumbersContainer = styled.View`
flexDirection : row;
alignItems: center;
paddingBottom: 5px;
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
`
