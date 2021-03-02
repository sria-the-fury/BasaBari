import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {Icon} from "react-native-elements";
import {TextComponent} from "../TextComponent";
import styled from "styled-components";
import {ListingsFullDetailsModal} from "../../modals/ListingsFullDetailsModal";

export const EachMyListing = (props) => {
    const {item} = props;
    const {images} = item;

    const [openMyListingsModal, setMyListingsModal] = useState(false);
    const closeMyListingsModal  = () => {
        setMyListingsModal(false);
    }



    return (
        <CardsContainer>

            <TimeContainer>
                {/*<View style={{alignItems: "center", flexDirection: 'row'}}>*/}
                {/*    <Icon name={'person-circle-outline'} type={'ionicon'} size={25} style={{marginRight: 5}}/>*/}
                {/*    <TextComponent >{item.postedBy}</TextComponent>*/}

                {/*</View>*/}

                <View style={{alignItems: "center", flexDirection: 'row'}}>
                    <Icon name={'time-outline'} type={'ionicon'} size={15} style={{marginRight: 10}}/>
                    <TextComponent small>{item.postedTime}</TextComponent>

                </View>


                <Icon raised name={'ellipsis-vertical'} type={'ionicon'} size={18} style={{marginRight: 10}}/>


            </TimeContainer>


            <FlatList data={images} renderItem={({item}) => renderImage(item)} keyExtractor={item => item.id.toString()} horizontal={true}
                      showsHorizontalScrollIndicator={false}/>

            <LocationContainer>
                <Icon name={'navigate'} type={'ionicon'} size={18} style={{marginRight: 10}} color={'blue'}/>
                <TextComponent bold semiLarge>{item.address}</TextComponent>

            </LocationContainer>

            {/*<BottomActionsButtonContainer>*/}
            {/*    <Icon raised name={'trash'} type={'ionicon'} size={20} style={{marginRight: 10}} color={'red'} />*/}
            {/*    <Icon raised name={'create'} type={'ionicon'} size={20} style={{marginRight: 10}} color={'black'}/>*/}

            {/*</BottomActionsButtonContainer>*/}

            <HomeItemsNumbersContainer>
                <HomeItemsNumbers>
                    <Icon name={'bed'} type={'ionicon'} size={20} style={{marginRight: 10}} color={'grey'} />
                    <TextComponent>3</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'bathtub'} type={'material'} size={20} style={{marginRight: 10}} color={'grey'} />
                    <TextComponent>2</TextComponent>
                </HomeItemsNumbers>

                <HomeItemsNumbers>
                    <Icon name={'restaurant'} type={'ionicon'} size={20} style={{marginRight: 10}} color={'grey'} />
                    <TextComponent>1</TextComponent>
                </HomeItemsNumbers>

                <TextComponent>Total Rooms: 4</TextComponent>

                <Icon raised name={'reader-outline'} type={'ionicon'} size={20} style={{marginRight: 10}} color={'grey'} onPress={() => setMyListingsModal(true)}/>

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
paddingBottom: 5px;
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
