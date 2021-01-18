import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, Button, Image,
  SafeAreaView, AppState, FlatList, Dimensions, TouchableOpacity, CameraRoll, Platform } from 'react-native';
import Clipboard from 'expo-clipboard';
import { Video, Audio } from 'expo-av';
import globalStyles from '../styles';
import * as Sharing from 'expo-sharing';
import CachedImage from '../components/cachedImage';
import { URIContext } from '../components/contexts';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AdMobInterstitial } from 'expo-ads-admob';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function Repost({ route, navigation }) {

  const [linkExists, setLink] = useState(null);
  const [image, setImg] = useState('');
  const [cachedURI, setCachedURI] = useState(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    (async () => {
      if (route.params.route === 'image') {
        setImg(route.params.image);
        setLink(true)
      } else {
        download();
      }

      AdMobInterstitial.setAdUnitID('ca-app-pub-7386815827880951/8633719630');
      try {
        await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true});
      } catch {}
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true
      });
    })();
  }, []);

  function Collection({ images }) {

    const [refresher, setRefresh] = useState(false);

    return (
      <View style={{height: '100%', width: '100%'}}>
        <FlatList
          data={images.data}
          numColumns={3}
          extraData={refresher}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => {
              item.isSelected = !item.isSelected;
              setRefresh(!refresher);
            }} style={{height: screenWidth / 3, width: screenWidth / 3}}>
              <CachedImage isVideo={item.type === 'video' ? true : false} isCollection={true} item={item} source={{ uri: item.data }} style={{height: '100%', width: '100%'}} resizeMode='cover' />
              {item.type === 'video' &&
                <View style={{position: 'absolute', bottom: 5, right: 5, backgroundColor: 'transparent'}}>
                  <Ionicons name="videocam" size={24} color="white" />
                </View>
              }
              {item.isSelected &&
                <View style={{position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, justifyContent: 'center', alignItems: 'center'}}>
                  <AntDesign name="check" size={65} color="white" />
                </View>
              }
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  const saveToHome = async data => {
    if (data.type === 'collection') {
      data.data.forEach((item, i) => {
        item.avatar = data.avatar;
        item.caption = data.caption;
        item.username = data.username;
      });
    }
    let saveValue;
    try {
      const existingImages = await AsyncStorage.getItem('@downloaded_images');
      if (existingImages !== null) {
        saveValue = JSON.parse(existingImages);
        //console.log(saveValue);
        let exists = false;
        if (data.type === 'collection') {
          saveValue.forEach((item, i) => {
            if (item.data === data.data[0].data) {
              console.log('exists');
              exists = true;
            }
          });
        } else {
          saveValue.forEach((item, i) => {
            if (item.data === data.data) {
              console.log('exists')
              exists = true;
            }
          });
        }
        if (!exists) {
          if (data.type === 'collection') {
            data.data.forEach((item, i) => {
              saveValue.push(item);
            });
          } else {
            saveValue.push(data);
          }
        } else {
          return;
        }
      } else {
        saveValue = data.type === 'collection' ? data.data : [data];
      }
    } catch {
      saveValue = data.type === 'collection' ? data.data : [data];
    }
    await AsyncStorage.setItem('@downloaded_images', JSON.stringify(saveValue));
    console.log('saved');
  }

  const download = async () => {
    const link = await Clipboard.getStringAsync();
    console.log(link)
    if (link) {
      let urlRequest = link.split('/?')[0] + '?__a=1';
      fetch(urlRequest).then(res => res.json().then(data => {
        //console.log(data.graphql.shortcode_media)
        if (data.graphql.shortcode_media.__typename === 'GraphImage') {
          let img = {
            type: 'image',
            data: data.graphql.shortcode_media.display_url,
            caption: data.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text,
            avatar: data.graphql.shortcode_media.owner.profile_pic_url,
            username: data.graphql.shortcode_media.owner.username
          }
          setImg(img)
          saveToHome(img);
        } else if (data.graphql.shortcode_media.__typename === 'GraphSidecar') {
          let images = [];
          data.graphql.shortcode_media.edge_sidecar_to_children.edges.map(item => {
            images.push({
              data: item.node.__typename === 'GraphVideo' ? item.node.video_url : item.node.display_url,
              type: item.node.__typename === 'GraphVideo' ? 'video' : 'image'
            });
          });
          const obj = {
            type: 'collection',
            caption: data.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text,
            avatar: data.graphql.shortcode_media.owner.profile_pic_url,
            username: data.graphql.shortcode_media.owner.username,
            data: images
          };
          setImg(obj);
          saveToHome(obj);
        } else {
          let video = {
            type: 'video',
            data: data.graphql.shortcode_media.video_url,
            caption: data.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text,
            avatar: data.graphql.shortcode_media.owner.profile_pic_url,
            username: data.graphql.shortcode_media.owner.username
          }
          setImg(video);
          saveToHome(video);
        }
      }))
      setLink(true);
    }
  }

  const showAd = async () => {
    try {
      AdMobInterstitial.addEventListener('interstitialDidClose', () => share())
      await AdMobInterstitial.showAdAsync();
    } catch {
      AdMobInterstitial.removeAllListeners();
    }
  }

  const share = async () => {
    AdMobInterstitial.removeAllListeners();
    AdMobInterstitial.requestAdAsync();
    if (!(await Sharing.isAvailableAsync())) {
      alert('Unable to save to camera roll');
      return
    } else if (image === '') {
      alert('Unable to save to camera roll');
      return
    }
    const { granted } = await MediaLibrary.requestPermissionsAsync();
    if (!granted) {
      return
    }
    try {
      if (image.type === 'collection') {
        image.data.forEach(async (item, i) => {
          if (item.isSelected) {
            await MediaLibrary.saveToLibraryAsync(item.cachedURI);
          }
        });
      } else {
        await MediaLibrary.saveToLibraryAsync(image.cachedURI);
      }
      alert(`Media has been saved to your camera roll!`);
    } catch (e) {
      console.log(e)
      alert('Image could not be saved.');
    }
  }

  if (linkExists) {
    //Displays image from copied link.
    return (
      <SafeAreaView style={{height: '100%', width: '100%', backgroundColor: 'white'}}>
        <View style={[{flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingTop: 10, paddingBottom: 10, backgroundColor: 'white', borderColor: 'gainsboro', borderBottomWidth: 1}]}>
          <Image source={{ uri: image.avatar }} style={{height: 65, width: 65, borderRadius: 65 / 2}} />
          <Text style={{fontSize: 22, fontWeight: 'bold', marginLeft: 10}}>{ image.username }</Text>
        </View>
        <View style={{height: screenHeight - 450, width: '100%', paddingTop: 10, backgroundColor: 'white', paddingBottom: 10}}>
          {image.type === 'image' &&
            <CachedImage item={[image, setImg]} source={{ uri: image.data }} style={{height: '100%', width: '100%', paddingLeft: 10, paddingRight: 10}} resizeMode='contain' />
          }
          {image.type === 'collection' &&
            <Collection images={image} />
          }
          {image.type === 'video' &&
            <TouchableWithoutFeedback onPress={() => setMuted(!muted)}>
              <View>
                <CachedImage
                  item={[image, setImg]}
                  isVideo={true}
                  shouldPlay={true}
                  source={{ uri: image.data }}
                  isMuted={muted}
                  resizeMode='contain'
                  isLooping={true}
                  style={{width: '100%', height: '100%'}}
                />
              </View>
            </TouchableWithoutFeedback>
          }
        </View>
        <View style={{width: '100%', paddingTop: 10, paddingBottom: 5, paddingRight: 5, paddingLeft: 5, flexDirection: 'row', backgroundColor: 'white', alignItems: 'center'}}>
          <Image source={{ uri: image.avatar }} style={{height: 45, width: 45, borderRadius: 45 / 2}} />
          <View style={{marginLeft: 5, backgroundColor: 'white', borderRadius: 5}}>
            <Text numberOfLines={3} style={{fontSize: 13, width: screenWidth - 70, padding: 5}}>{ image.caption }</Text>
          </View>
        </View>
        <View style={{width: '100%', paddingTop: 15, backgroundColor: 'white', height: '100%'}}>
          <TouchableOpacity onPress={() => showAd()} style={[{width: screenWidth - 40, height: 70, marginLeft: 20, borderRadius: 10, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center'}, styles.buttonShadow]}>
            <LinearGradient
              colors={['#eb402a', '#eb9b2a', '#fff526']}
              start={{x: -0.3, y: -0.3}}
              end={{x: 1.5, y: 1.5}}
              locations={[0.15, 0.62, 1.0]}
              style={{height: '100%', width: '100%', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}
            >
              <Text style={{fontSize: 24, fontWeight: 'bold', fontFamily: 'Montserrat-Bold'}}>Download</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  } else {
    //Displays instructions on how to repost.
    return (
      <SafeAreaView style={{height: '90%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <View style={{width: 240, alignItems: 'center'}}>
          <View style={styles.helpCircle}>
            <Text style={styles.helpCircleText}>1</Text>
          </View>
          <Text style={styles.helpText}>Click on the Instagram icon above to go to Instagram.</Text>
        </View>
        <View style={{width: 240, alignItems: 'center', marginTop: 50}}>
          <View style={styles.helpCircle}>
            <Text style={styles.helpCircleText}>2</Text>
          </View>
          <Text style={styles.helpText}>Choose a photo you would like to repost and click the three dots to the right of the username</Text>
        </View>
        <View style={{width: 240, alignItems: 'center', marginTop: 50}}>
          <View style={styles.helpCircle}>
            <Text style={styles.helpCircleText}>3</Text>
          </View>
          <Text style={styles.helpText}>Tap 'Copy Link' and return to Repost.</Text>
        </View>
      </SafeAreaView>
    );
  }


  // return (
  //   <View style={{height: '100%', width: '100%', marginTop: 10}}>
  //     { image !== '' &&
  //       <View style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
  //         { image.type === 'image' ?
  //           <Image source={{uri: image.data}} style={{height: '100%', width: '100%'}} resizeMode='contain' /> :
  //           <View style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
  //             { image.type === 'collection' ?
  //               <FlatList
  //                 numColumns={3}
  //                 data={image.data}
  //                 renderItem={({item, index}) => (
  //                   <View key={index} style={{height: screenWidth / 3 - 20, width: screenWidth / 3 - 20}}>
  //                     <Image key={index + 101} source={{ uri: item.uri }} resizeMode='cover' style={{height: '100%', width: '100%'}} />
  //                   </View>
  //                 )}
  //               /> :
  //               <Video
  //                 source={{ uri: image.data }}
  //                 resizeMode='cover'
  //                 isMuted={true}
  //                 shouldPlay={false}
  //                 style={{height: '100%', width: '100%'}}
  //               />
  //             }
  //           </View>
  //         }
  //         <View style={{width: '100%'}}>
  //           <Text>{ image.caption }</Text>
  //         </View>
  //       </View>
  //     }
  //   </View>
  // );
}

const styles = StyleSheet.create({
  input: {
    height: 60,
    width: 300,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 18
  },
  shadow: {
    shadowOpacity: 0.1,
    shadowOffset: {width: 2, height: 1},
  },
  buttonShadow: {
    shadowOpacity: 0.4,
    shadowOffset: {width: 3, height: 3},
    shadowColor: 'red',
    shadowRadius: 10
  },
  helpCircle: {
    borderRadius: 50,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: 60,
  },
  helpCircleText: {
    fontSize: 40,
    fontWeight: 'bold',
    padding: 3,
  },
  helpText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 3,
  }
})
