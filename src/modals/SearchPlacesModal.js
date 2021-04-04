import React, {useEffect, useState} from "react";
import {View, Modal, ScrollView, StyleSheet, ToastAndroid} from "react-native";
import styled from "styled-components";
import {Icon} from "react-native-elements";
import { SearchBar, ListItem } from 'react-native-elements';
import axios from "axios";
import _ from 'lodash';

export const SearchPlacesModal = (props) => {
    const {modalVisible, modalHide, headerColor, updateQuery} = props;


    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);
    const [get, setGet] = useState(null);

    const updateSearch = (search) => {
        setSearch(search);

    }

    const onClearSearch = () => {
        setResult(null);
        setSearch('')
    }

    useEffect(() => {

        if(search !== ''){
            axios.get(`https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json?apiKey=RZHfG-HgG-ndSdJsDf17xPpdlRREGHDN0ZycUlCFIEY&query=${search}`)
                .then((response) => {
                    const {data} = response;
                    if(data.suggestions) {
                        let placeData=[];
                        _.each(data.suggestions, (suggestion) =>{
                            placeData.push({
                                city: suggestion.address.city,
                                county: suggestion.address.county,
                                state: suggestion.address.state,
                                country: suggestion.address.country
                            });


                        });
                        if(placeData.length !== 0) {
                            setResult(placeData);
                        }

                    }


                }).catch((error) => {
                    ToastAndroid.show(error.message + ' searching places');
                console.log(error.message + '@searching');
            })
        }


    }, [search]);

    const filterPlaceData = result ? _.filter(result, (eachPlace) => {
        return (eachPlace.city && eachPlace.state && eachPlace.county && eachPlace.country)
        }
    ) : null


    const ifSearchBarMatchWithCity = filterPlaceData ? _.filter(filterPlaceData, {city: search}
    ) : false;



    const updateQueryFromSelect = (selectedPlace) => {
        updateQuery(selectedPlace);
        onClearSearch();
        modalHide();

    };


    return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    modalHide()
                }}
            >
                <ModalView>
                    <ModalHeader>
                            <Icon name={'chevron-down-outline'} type={'ionicon'} size={30} color={'white'} onPress={() => modalHide()}/>
                        <SearchBar onClear={() => onClearSearch()}
                                   containerStyle={style.searchBarMainContainer}
                                   inputStyle={{height: 50, backgroundColor: 'rgba(0,0,0,0)', color: ifSearchBarMatchWithCity?.length ? '#06D6A0' : 'white'}}

                                   inputContainerStyle={{backgroundColor: 'rgba(0,0,0,0)', height: '100%'}}
                                   placeholder="Search by place name..."
                                   onChangeText={updateSearch}
                                   value={search}
                        />

                    </ModalHeader>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View>
                            {
                                filterPlaceData && filterPlaceData.map((res, key) => (

                                    <ListItem key={key} bottomDivider
                                              containerStyle={{width: 600, backgroundColor: 'rgba(0,0,0,0)'}} onPress={() => updateQueryFromSelect(res)}>
                                        <Icon name={'location'} type={'ionicon'} size={25} color={'#06D6A0'}/>

                                        <ListItem.Content>

                                            <ListItem.Title style={{color: search.toLowerCase() === res.city.toLowerCase() ? '#06D6A0' : 'white'}}>
                                                {res.city === res.county ? res.city : `${res.city}, ${res.county}`}
                                            </ListItem.Title>
                                            <ListItem.Subtitle style={{color: 'grey'}} >{res.state}, {res.country}</ListItem.Subtitle>

                                        </ListItem.Content>

                                    </ListItem>
                                ))

                            }
                        </View>
                    </ScrollView>



                </ModalView>
            </Modal>
    );
};

const StatusBarAndTopHeaderBGColor = '#d0ff00';

const ModalView = styled.View`
backgroundColor: white;
borderTopRightRadius: 20px;
borderTopLeftRadius: 20px;
backgroundColor: rgba(0, 0, 0, 0.8);
alignItems: center;
shadowColor: #000;
width: 100%;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
position: absolute;
bottom: 0;
height: 40%;

`;

const ModalHeader = styled.View`
marginTop: 10px;
paddingVertical: 10px;
width:100%;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal:10px;
borderBottomRightRadius: 10px;
borderBottomLeftRadius: 10px;

`;

const style = StyleSheet.create({

    searchBarMainContainer : {
        backgroundColor: 'rgba(0,0,0, 0)',
        width: '85%', height: 50,
        borderRadius: 50, borderWidth: 1,
        borderColor: 'white',
        borderBottomColor: 'white',
        borderTopColor: 'white'
    },




});
