import React, { useState, useEffect } from 'react';
import { View, Text, Image, Dimensions, SafeAreaView, TouchableOpacity, FlatList, Button } from 'react-native';
import { Video } from 'expo-av';
import globalStyles from '../styles';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CachedImage from '../components/cachedImage';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Home({ navigation }) {

  const [gridImages, setGrid] = useState([]);

  useEffect(() => {
    (async () => {
      const savedImages = await AsyncStorage.getItem('@downloaded_images');
      if (savedImages !== null) {
        setGrid(JSON.parse(savedImages));
      }
      //console.log(gridImages);
    })();
  }, []);

  return (
    <View style={{height: '100%', width: '100%'}}>
      <TouchableOpacity onPress={() => navigation.navigate('Repost', {route: 'button'})} style={{width: '100%', height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent'}}>
        <View style={{width: screenWidth - 20, height: 60, backgroundColor: 'snow', borderRadius: 7, justifyContent: 'center', alignItems: 'center', borderWidth: 0.7, borderColor: 'gainsboro', elevation: 1, shadowOffset: {width: 1, height: 2}, shadowOpacity: 0.5}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', fontFamily: 'Montserrat-Bold'}}>Click here to Repost</Text>
        </View>
      </TouchableOpacity>
      <View style={{height: '87.5%', width: '100%'}}>
        <FlatList
          data={gridImages.length !== 0 ? gridImages.reverse() : []}
          extraData={gridImages}
          numColumns={4}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Repost', {route: 'image', image: item})} style={{width: screenWidth / 4, height: screenWidth / 4, borderWidth: 1}}>
              <CachedImage isVideo={item.type === 'video' ? true : false} home={true} source={{ uri: item.data }} style={{height: '100%', width: '100%'}} resizeMode='cover' />
              {item.type === 'video' &&
                <View style={{position: 'absolute', right: 2, bottom: 2}}>
                  <Ionicons name="videocam" size={18} color="white" />
                </View>
              }
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}
