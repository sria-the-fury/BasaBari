/**
 * @format
 */

import {AppRegistry} from 'react-native';
import React from "react";
import App from './App';
import {name as appName} from './app.json';
import {Provider as PaperProvider} from 'react-native-paper';

export default Main = () => {
    return(
        <PaperProvider>
            <App/>
        </PaperProvider>

    )
}

AppRegistry.registerComponent(appName, () => Main);
