import React, {useState} from 'react';
import styled from "styled-components";
import {TextComponent} from "../components/TextComponent";
import {TempData} from "../TempData";
import {View} from "react-native";
import {Text, TouchableOpacity, StatusBar, FlatList, Image} from 'react-native';
import {Icon} from "react-native-elements";
import {EachMyListing} from "../components/EachMyListing";

export default function MyListingScreenAsModal(props) {


    return (
        <Container>
            <StatusBar backgroundColor={StatusBarAndTopHeaderBGColor}/>
            <HeaderContainer>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>

                    <Icon
                        name={'chevron-down-circle'}
                        type='ionicon'
                        color={'white'} size={40}
                    />

                </TouchableOpacity>

                <TextComponent medium bold color={'white'}>MY LISTINGS</TextComponent>

            </HeaderContainer>
            <FlatList data={TempData} renderItem={({item}) => <EachMyListing item = {item}/> } keyExtractor={item => item.id.toString()} showsVerticalScrollIndicator={false}/>
        </Container>
    )
}
const StatusBarAndTopHeaderBGColor = 'red';


const Container = styled.View`
flex:1;

`;

const HeaderContainer = styled.View`
backgroundColor: ${StatusBarAndTopHeaderBGColor};

 flexDirection: row;
 alignItems: center;
 paddingHorizontal: 32px;
 paddingVertical: 12px;
 justifyContent: space-between;


`;





