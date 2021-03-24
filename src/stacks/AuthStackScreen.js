import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import PhoneAuthScreen from "../screens/PhoneAuthScreen";


export default function AuthStackScreen() {
  const AuthStack = createStackNavigator();

  return (
    <AuthStack.Navigator headerMode={'none'}>
      <AuthStack.Screen name={'SignIn'} component={PhoneAuthScreen} />
    </AuthStack.Navigator>
  );
}
