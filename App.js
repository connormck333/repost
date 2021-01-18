import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Root from './src/navigation/root';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

export default function App() {

  const [fontsLoaded] = Font.useFonts({
    'Josefin-Sans': require('./assets/fonts/JosefinSans-Regular.ttf'),
    'Josefin-BoldItalic': require('./assets/fonts/JosefinSans-BoldItalic.ttf'),
    'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
    'Poppins': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf')
  });

  if (fontsLoaded) {
    return (
      <Root />
    );
  } else {
    return <AppLoading  />
  }
}
