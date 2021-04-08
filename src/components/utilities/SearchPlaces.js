import React, {useEffect, useState} from 'react'
import { ToastAndroid, ScrollView, StyleSheet} from 'react-native'
import {Icon, ListItem, SearchBar} from "react-native-elements";
import axios from "axios";
import _ from "lodash";
import styled from "styled-components";

export const SearchPlaces = (props) => {
    const {updateQuery,closeBottomSheet } = props;
    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);
    const [get, setGet] = useState(null);

    const updateSearch = (search) => {
        setSearch(search);

    }

    const onClearSearch = () => {
        setResult(null);
        setSearch('');
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
                ToastAndroid.show(error.message + ' @searching places', ToastAndroid.LONG);
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
        closeBottomSheet.current.close();

    };

    return (
        <SearchContainer style={style.SearchBarContainer}>
            <SearchHeader>
                <SearchBar onClear={() => onClearSearch()}
                           containerStyle={style.searchBarMainContainer}
                           inputStyle={{height: 50, backgroundColor: 'rgba(0,0,0,0)', color: ifSearchBarMatchWithCity?.length ? '#06D6A0' : 'white'}}

                           inputContainerStyle={{backgroundColor: 'rgba(0,0,0,0)', height: '100%'}}
                           placeholder="Search by place name..."
                           onChangeText={(search) =>updateSearch(search)}
                           value={search}
                />
            </SearchHeader>

            <ScrollView showsVerticalScrollIndicator={false}>

                <SuggestionsContainer>
                    {
                        filterPlaceData && filterPlaceData.map((result, key) => (

                            <ListItem key={key} bottomDivider
                                      containerStyle={{width: 600, backgroundColor: 'rgba(0,0,0,0)'}} onPress={() => updateQueryFromSelect(result)}>
                                <Icon name={'location'} type={'ionicon'} size={25} color={'#06D6A0'}/>

                                <ListItem.Content>

                                    <ListItem.Title style={{color: search.toLowerCase() === result.city.toLowerCase() ? '#06D6A0' : 'white'}}>
                                        {result.city === result.county ? result.city : `${result.city}, ${result.county}`}
                                    </ListItem.Title>
                                    <ListItem.Subtitle style={{color: 'grey'}} >{result.state}, {result.country}</ListItem.Subtitle>

                                </ListItem.Content>

                            </ListItem>
                        ))

                    }
                </SuggestionsContainer>
            </ScrollView>
        </SearchContainer>
    )
}

const style = StyleSheet.create({

    searchBarMainContainer : {
        backgroundColor: 'rgba(0,0,0, 0)',
        width: '100%',
        height: 50,
        borderRadius: 50, borderWidth: 1,
        borderColor: 'white',
        borderBottomColor: 'white',
        borderTopColor: 'white'
    }

});

const SearchHeader = styled.View`
width:100%;
flexDirection: row;
alignItems: center;
justifyContent: space-between;
paddingHorizontal:10px;
borderBottomRightRadius: 10px;
borderBottomLeftRadius: 10px;

`;

const SearchContainer = styled.View`
marginTop: 10px;
alignItems: center;
shadowColor: #000;
width: 100%;
shadowOpacity: 0.25;
shadowRadius: 4px;
elevation: 5;
height: 100%
`;

const SuggestionsContainer = styled.View`
marginBottom: 45px;
`;
