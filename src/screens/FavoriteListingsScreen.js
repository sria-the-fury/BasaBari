import React, {useContext, useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import styled from "styled-components";
import {Colors} from "../components/utilities/Colors";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {TextComponent} from "../components/TextComponent";
import {Badge, Icon} from "react-native-elements";
import {EachListing} from "../components/listings/EachListing";
import firestore from "@react-native-firebase/firestore";
import {FirebaseContext} from "../context/FirebaseContext";
import _ from 'lodash';

export default function FavoriteListingsScreen(props) {
    const firebase = useContext(FirebaseContext)
    const currentUserId = firebase.getCurrentUser().uid;

    const [ListingsData, setListingsData] = useState(null);




    useEffect(() => {

        const subscriber = firestore().collection('listings').orderBy('postedTime', 'desc').onSnapshot(
            docs=> {
                let data=[];
                if(docs) {
                    docs.forEach(doc => {
                        data.push({
                            id: doc.id,
                            postedTime: doc.data().postedTime,
                            address: doc.data().address,
                            images: doc.data().images,
                            userId: doc.data().userId,
                            roomNumbers: doc.data().roomNumbers,
                            facilities: doc.data().facilities,
                            forBachelor: doc.data().forBachelor,
                            forFamily: doc.data().forFamily,
                            rentPerMonth: doc.data().rentPerMonth,
                            isNegotiable: doc.data().isNegotiable,
                            usersInFav: doc.data().usersInFav,
                            moreDetails: doc.data().moreDetails,
                            location: doc.data().location
                        });

                    });
                    if(data.length>0){
                        const favListings = _.filter( data, (singleData) => {
                            return singleData?.usersInFav?.includes(currentUserId);
                        });

                        setListingsData(favListings);
                    }

                }


            });

        return () => subscriber();


    }, []);




    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={StatusBarAndTopHeaderBGColor}/>
            <HeaderContainer>
                <View>
                    <Icon name={'heart'} type={'ionicon'} size={32}
                          style={{marginRight: 5}} color={Colors.favorite}
                    />

                    { ListingsData?.length ?
                        <Badge status={'success'} containerStyle={{position: 'absolute', right: 0,borderColor: Colors.primaryBody, borderWidth: 2, borderRadius:50}}
                               value={<Text style={{color:'white', fontSize: 10}}>{ListingsData.length}</Text>} />
                        : null
                    }

                </View>
                <TextComponent color={'white'} bold medium>FAVORITE LISTINGS</TextComponent>
            </HeaderContainer>
            { ListingsData && ListingsData.length !== 0 ?
                <FlatList data={ListingsData} renderItem={({item}) => <EachListing item = {item} navigation={props.navigation}/> } keyExtractor={item => item.id.toString()} showsVerticalScrollIndicator={false}/>
                :
                <NoListingContainer>
                    <TextComponent bold medium>You don't have any favorite Listing</TextComponent>
                </NoListingContainer>
            }




        </Container>

    )
}

const StatusBarAndTopHeaderBGColor = Colors.primaryStatusbarColor;

const Container = styled.SafeAreaView`
flex:1

`;

const HeaderContainer = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};
 flexDirection: row;
 alignItems: center;
 paddingHorizontal: 20px;
  paddingVertical: 12px;
 justifyContent: space-between;

`;

const NoListingContainer = styled.View`
alignItems: center;
flex: 1;
justifyContent: center;

`;

