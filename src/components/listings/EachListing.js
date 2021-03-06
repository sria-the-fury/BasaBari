import React, {useContext, useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';
import {Icon} from "react-native-elements";
import {TextComponent} from "../TextComponent";
import styled from "styled-components";
import {ListingsFullDetailsModal} from "../../modals/ListingsFullDetailsModal";
import moment from "moment";
import firestore from "@react-native-firebase/firestore";
import {FirebaseContext} from "../../context/FirebaseContext";


export const EachListing = (props) => {
    const firebase = useContext(FirebaseContext);
    const {item} = props;
    const {images, roomNumbers, forFamily, forBachelor, usersInFav} = item;
    const [postedUser, setPostedUser] = useState('');
    const currentUserId = firebase.getCurrentUser().uid;


    const [openMyListingsModal, setMyListingsModal] = useState(false);
    const closeMyListingsModal  = () => {
        setMyListingsModal(false);
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
        if(item.userId === currentUserId) return true;
        else return false;

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

                <Icon name={'heart'} type={'ionicon'} size={25}
                      style={{marginRight: 5}} color={isCurrentUserFavList ? '#b716af' : 'grey'}
                      onPress={() => addRemoveFavorite(item.id)}/>

                <View style={{alignItems: "center", flexDirection: 'row'}}>
                    <Icon name={'time-outline'} type={'ionicon'} size={15} style={{marginRight: 5}}/>
                    <TextComponent small>{postedTime()}</TextComponent>

                </View>

                <View style={{alignItems: "center", flexDirection: 'row'}}>
                    <PostedUserAvatar source={{uri: postedUser.profilePhotoUrl}} style={{marginRight: 2}}/>
                    {/*<Icon name={'person-circle-outline'} type={'ionicon'} size={25} style={{marginRight: 5}}/>*/}

                    <TextComponent >{getFirstNameFromPostedUser()}</TextComponent>

                </View>



            </TimeContainer>


            <FlatList data={images} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.imageId} horizontal={true}
                      showsHorizontalScrollIndicator={false}/>

            <LocationContainer>
                <Icon name={'navigate'} type={'ionicon'} size={18} style={{marginRight: 5}} color={'blue'}/>
                <TextComponent bold semiLarge numberOfLines={1} ellipsizeMode={'tail'}>{item.address}</TextComponent>

            </LocationContainer>

            {/*<BottomActionsButtonContainer>*/}
            {/*    <Icon raised name={'trash'} type={'ionicon'} size={20} style={{marginRight: 10}} color={'red'} />*/}
            {/*    <Icon raised name={'create'} type={'ionicon'} size={20} style={{marginRight: 10}} color={'black'}/>*/}

            {/*</BottomActionsButtonContainer>*/}

            <HomeItemsNumbersContainer>
                <HomeItemsNumbers>
                    <Icon name={'bed'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>{roomNumbers.bedRoom}</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'bathtub'} type={'material'} size={20} style={{marginRight: 5}} color={'grey'} />
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

                <Icon raised name={'reader-outline'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} onPress={() => setMyListingsModal(true)}/>

            </HomeItemsNumbersContainer>

            <ListingsFullDetailsModal modalVisible={openMyListingsModal} modalHide={closeMyListingsModal} listingsData={item} postedUserInfo={postedUser}
                                      currentUserListings={currentUserListings()}/>
        </CardsContainer>
    )
}

const renderImage= (image) => {

    return(
        <View style={{marginHorizontal:15}}>
            <ListingsImagesContainer source={{uri: image.imageUrl}}/>

        </View>
    )

};

const ListingsImagesContainer = styled.Image`
height:150px;
width:150px;
borderRadius: 10px;

`;

const CardsContainer = styled.View`

marginHorizontal:10px;
 marginVertical:10px;
  backgroundColor: white;
   paddingHorizontal: 10px;
    paddingVertical:10px;
     borderRadius:10px;
     overflow: hidden;
     elevation: 10;
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

const BottomActionsButtonContainer = styled.View`
flexDirection : row;
alignItems: center;
paddingBottom: 5px;
paddingTop: 5px
justifyContent: space-between;
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
