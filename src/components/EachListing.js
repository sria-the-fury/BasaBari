import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';
import {Icon} from "react-native-elements";
import {TextComponent} from "./TextComponent";
import styled from "styled-components";
import {ListingsFullDetailsModal} from "../modals/ListingsFullDetailsModal";
import moment from "moment";
import firestore from "@react-native-firebase/firestore";

export const EachListing = (props) => {
    const {item} = props;
    const {images} = item;
    const [postedUser, setPostedUser] = useState('');


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
        const nameAsArray = item.postedBy.split(' ');
        return nameAsArray[0];
    }


    return (
        <CardsContainer>

            <TimeContainer>

                <Icon name={'heart'} type={'ionicon'} size={25} style={{marginRight: 5}} color={item.favorite ? '#b716af' : 'grey'}/>

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


            <FlatList data={images} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.id.toString()} horizontal={true}
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
                    <TextComponent>3</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'bathtub'} type={'material'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>2</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'restaurant'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} />
                    <TextComponent>1</TextComponent>
                </HomeItemsNumbers>

                <TextComponent>Total Room: 4</TextComponent>

                <Icon raised name={'reader-outline'} type={'ionicon'} size={20} style={{marginRight: 5}} color={'grey'} onPress={() => setMyListingsModal(true)}/>

            </HomeItemsNumbersContainer>

            <ListingsFullDetailsModal modalVisible={openMyListingsModal} modalHide={closeMyListingsModal} listingsData={item}/>
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
