import React,{useState} from 'react';
import {Text} from 'react-native';
import styled from "styled-components";

export const CustomCheckbox = ({checked,title, alignCheck, textColor, checkedIcon , textSize, textWeight, spacing}) => {

    const fontSize = textSize ? textSize : 15;
    const fontWeight = textWeight ? textWeight : 'normal';
    const color = checked ? 'green' : textColor ? textColor : 'black';
    const spacingIconAndText = spacing ? spacing : 5;


  return (
    <Container style={{alignSelf: alignCheck ?? 'flex-start'}}>
       {checkedIcon}
      <Text  style={{fontSize: fontSize , color: color, fontWeight: fontWeight, marginLeft: spacingIconAndText, marginVertical: 10}}>{title}</Text>
    </Container>
  )
}

const Container = styled.View`
flexDirection: row;
alignItems: center;

`;
