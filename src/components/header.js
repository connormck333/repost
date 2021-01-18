import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Header({ navigation }) {

  return (
    <LinearGradient
      colors={['#eb402a', '#eb9b2a', '#fff526']}
      start={{x: -0.3, y: -0.3}}
      end={{x: 1.5, y: 1.5}}
      locations={[0.15, 0.42, 1.0]}
    >
      <SafeAreaView style={{width: '100%', height: 100, backgroundColor: 'transparent', flexDirection: 'row', shadowOpacity: 0.4, shadowOffset: {height: 2}, shadowColor: 'red', shadowRadius: 10}}>
        <View style={{width: screenWidth - 160, height: '100%', justifyContent: 'center'}}>
          <Text style={[globalStyles.title, {marginLeft: 10}]}>Repost</Text>
        </View>
        <View style={{width: 145, height: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => {
            Linking.openURL('http://instagram.com/')
          }}>
            <AntDesign name="instagram" size={32} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
