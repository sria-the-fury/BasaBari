import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {FlatList, ScrollView, View} from 'react-native';
import {Icon} from "react-native-elements";
import {EachListing} from "../components/listings/EachListing";
import firestore from "@react-native-firebase/firestore";
import {FocusedStatusbar} from "../components/custom-statusbar/FocusedStatusbar";
import {Colors} from "../components/utilities/Colors";

import _ from "lodash";
import {Chip} from "react-native-paper";
import LottieView from "lottie-react-native";

export default function  HomeScreen (props) {

    const [ListingsData, setListingsData] = useState(null);
    const [sortByRent, setSort] = useState(true);
    const [rentForBachelor, setRentForBachelor] = useState(false);
    const [rentForFamily, setRentForFamily] = useState(false);





    useEffect(() => {

        const subscriber = firestore().collection('listings').orderBy('postedTime', 'desc')
            .onSnapshot(
                docs=> {
                    let data=[];
                    if(docs) {
                        docs.forEach(doc => {
                            const {listingId, postedTime, address, images, userId, roomNumbers,
                                facilities, forBachelor, forFamily, rentPerMonth, isNegotiable, usersInFav, moreDetails, location, interestedTenantId} = doc.data();
                            data.push({
                                id: doc.id,
                                listingId, postedTime, address, images, userId, roomNumbers,
                                facilities, forBachelor, forFamily, rentPerMonth, isNegotiable, usersInFav, moreDetails, location, interestedTenantId
                            });

                        });
                        if(data?.length > 0 ) {
                            let sortByRentValue = _.orderBy(data, ['rentPerMonth', 'postedTime'], [sortByRent ? 'asc' : 'desc', 'desc']);
                            setListingsData(sortByRentValue);


                        }
                    }

                });

        return () => subscriber();


    }, [sortByRent]);

    const [sliderValue, setSliderValue] = useState(3500);
    const sorting = () => {
        setSort(!sortByRent);
    }
    const sortByRentTenantType = () => {
        if(rentForBachelor) {
            return _.filter(ListingsData, {forBachelor: true})
        }
        else if(rentForFamily) {
            return _.filter(ListingsData, {forFamily: true})
        }
        else return ListingsData;


    }




    return (
        <Container>
            <FocusedStatusbar barStyle="light-content" backgroundColor={Colors.primaryStatusbarColor}/>
            <HeaderContainer style={{paddingVertical: 12, backgroundColor: Colors.primaryBody}}>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Chip icon={sortByRent ? 'sort-ascending' : "sort-descending"} mode={'outlined'}
                          style={{marginHorizontal: 5, backgroundColor: Colors.primaryBodyLight}}
                          onPress={() => sorting()}
                          theme={{color: {background: 'transparent', primary: 'red'}}}
                          children={<TextComponent color={'white'}>Rent/Month</TextComponent>}/>

                    <Chip mode={'outlined'}
                          onPress={() => {setRentForFamily(false); setRentForBachelor(!rentForBachelor);}}
                          style={{marginHorizontal: 5, backgroundColor: rentForBachelor ? Colors.favorite : Colors.primaryBodyLight}}
                          children={
                              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                  <Icon name={'person'} type={'md'} color={Colors.appIconColor} size={15}/>
                                  <TextComponent color={'white'}>Bachelor</TextComponent>
                              </View>

                          }/>
                    <Chip mode={'outlined'}
                          onPress={() => {setRentForBachelor(false);setRentForFamily(!rentForFamily)}}
                          style={{marginHorizontal: 5, backgroundColor: rentForFamily ? Colors.favorite : Colors.primaryBodyLight}}
                          children={
                              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                  <Icon name={'family-restroom'} type={'md'} color={Colors.appIconColor} size={15}/>
                                  <TextComponent color={'white'}>Family</TextComponent>
                              </View>

                          }/>

                    {/*<Chip mode={'outlined'}*/}
                    {/*      onPress={() => {setRentForBachelor(false)}}*/}
                    {/*      style={{marginHorizontal: 5}}*/}
                    {/*      children={*/}
                    {/*          <View style={{flexDirection: 'row', alignItems: 'center'}}>*/}
                    {/*              <Icon name={'home'} type={'md'} color={Colors.appIconColor} size={15}/>*/}
                    {/*              <TextComponent color={'white'}>All</TextComponent>*/}
                    {/*          </View>*/}

                    {/*      }/>*/}

            </ScrollView>
            </HeaderContainer>

            {/*<Slider*/}
            {/*    onSlidingComplete={() => sortListingBySlider(sliderValue)}*/}
            {/*    value={sliderValue}*/}
            {/*    maximumValue={30000}*/}
            {/*    minimumValue={3500}*/}
            {/*    step={500}*/}
            {/*    trackStyle={{ height: 10, backgroundColor: 'transparent' }}*/}
            {/*    minimumTrackTintColor={Colors.appIconColor}*/}
            {/*    thumbStyle={{ height: 20, width: 20, backgroundColor: 'transparent' }}*/}
            {/*    onValueChange={(value) => setSliderValue(value )}*/}
            {/*    thumbProps={{*/}
            {/*        children: (*/}
            {/*                <Icon*/}
            {/*                    name="home"*/}
            {/*                    reverse*/}
            {/*                    type="font-awesome"*/}
            {/*                    size={15}*/}
            {/*                    containerStyle={{bottom: 15, right: 15}}*/}
            {/*                    color={Colors.appIconColor}*/}
            {/*                />*/}

            {/*        ),*/}
            {/*    }}*/}
            {/*/>*/}


            <FlatList data={sortByRentTenantType()}
                      ListEmptyComponent={
                          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '10%'}}>
                              <LottieView source={require('../../assets/lottie-animations/home.json')} autoPlay loop style={{width: 120}} />
                              <TextComponent bold medium>No listing found</TextComponent>
                          </View>}
                      renderItem={({item}) => <EachListing item = {item} navigation={props.navigation}/> }
                      keyExtractor={item => item.id} showsVerticalScrollIndicator={false}/>

        </Container>
    )

}

const Container = styled.SafeAreaView`
flex:1;
backgroundColor: white;

`;

const HeaderContainer = styled.View`
 elevation: 5;
         shadowColor: #000;
          shadowOpacity: 1;
                    shadowRadius: 5.32px;

`;





