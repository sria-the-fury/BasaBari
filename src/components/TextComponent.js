import React from 'react';
import styled from 'styled-components';

export const TextComponent = ({...props}) => {
  return <Text {...props}>{props.children}</Text>;
};

const Text = styled.Text`
  color: ${(props) => props.color ?? '#414959'};
  margin: ${(props) => props.margin ?? 0};
  padding: ${(props) => props.padding ?? 0};

  ${({title, large, semiLarge, medium, mediumPro, small, tiny, extraTiny}) => {
    switch (true) {
      case title:
        return 'font-size: 32px;';
      case large:
        return 'font-size: 24px;';
      case semiLarge:
        return 'font-size: 20px;';
      case mediumPro:
        return 'font-size: 18px;';
      case medium:
        return 'font-size: 16px;';

      case small:
        return 'font-size: 13px';
      case tiny:
        return 'font-size: 11px';
      case extraTiny:
        return 'font-size: 8px';
      default:
        return 'font-size: 14px;';
    }
  }}

  ${({light, semi, bold, heavy}) => {
    switch (true) {
      case light:
        return 'font-weight: 300;';
      case semi:
        return 'font-weight: 300;';

      case bold:
        return 'font-weight: bold';
      case heavy:
        return 'font-weight: 900';
      default:
        return 'font-weight: normal;';
    }
  }}

${({center, right, justify}) => {
    switch (true) {
      case center:
        return 'text-align: center;';
      case right:
        return 'text-align: right;';

      case justify:
        return 'text-align: justify';
      default:
        return 'text-align: left;';
    }
  }}
`;
