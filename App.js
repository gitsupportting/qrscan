import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, Platform, TouchableOpacity, Linking, PermissionsAndroid } from 'react-native';
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
import RNFetchBlob from 'rn-fetch-blob';
// import email from 'react-native-email';
import SoundPlayer from 'react-native-sound-player';
import AsyncStorage from '@react-native-community/async-storage';
import Mailer from 'react-native-mail';
var RNFS = require('react-native-fs');
var num = 0;
var values_temp = [];
var data2 = [];
var is_save = true;
var filesavepath = `${RNFetchBlob.fs.dirs.DocumentDir}/data1.csv`;
export default class App extends Component {
  constructor() {

    super();

    this.state = {

      QR_Code_Value: '',

      Start_Scanner: false,
      values: [],
      is_exist: false,
      showView: false,
      is_start: true,
    };

    setInterval(() => {
      this.setState(previousState => {
        return { showView: !previousState.showView };

      });
    },
      // Define blinking time in milliseconds
      2000
    );
    this.getData();
    //this.init();
  }
  storeData = async () => {
    try {
      await AsyncStorage.setItem('@storage_Key', filesavepath)
    } catch (e) {
      console.log(e);
    }
  }
  getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_Key')
      if (value) {
        this.init();
      }
    } catch (e) {
      console.log(e);
    }

  }
  init = () => {
    var filePath;
    if (Platform.OS === 'ios') {
      //let arr = fileUri.split('/')
      filePath = filesavepath
    } else {
      filePath = filesavepath;
    }

    RNFetchBlob.fs.readFile(filePath, 'utf8')
      .then((data) => {
        var data1 = [];
        var i;
        data1 = data.split(/\n/g);
        for (i = 0; i < data1.length - 1; i++) {
          data2[i] = data1[i].split(',')[0];
        }
      })
      .catch(error => console.error(error));
  }
  openLink_in_browser = () => {

    Linking.openURL(this.state.QR_Code_Value);

  }

  onQR_Code_Scan_Done = (QR_Code) => {
    this.getData();
    this.setState({
      is_start: false
    })
    let index = values_temp.findIndex(x => x[0] === QR_Code);
    let index_csv = data2.findIndex(y => y === QR_Code);
    if (index === -1 && index_csv === -1) {
      values_temp.push([QR_Code, (new Date()).toISOString()]);
    } else {
      this.setState({
        is_exist: true
      })
    }
    var is_wrong;
    setTimeout(() => {
      is_wrong = this.state.is_exist;
      if (is_wrong == true) {
        SoundPlayer.playSoundFile('wrong', 'mp3');
      } else {
        SoundPlayer.playSoundFile('correct', 'mp3');

      }
    }, 100);
    setTimeout(() => {
      if (this.state.is_start == false) {
        this.setState({
          is_start: true
        })
      }
    }, 1000);
    is_save = true;
    this.setState({
      Start_Scanner: false
    })
    // console.warn('values_temp: ', values_temp)

    this.setState({ QR_Code_Value: QR_Code });
    // this.setState({ Start_Scanner: false });
  }

  open_QR_Code_Scanner = () => {
    this.setState({
      is_exist: false
    })
    this.getData();
    var that = this;

    if (Platform.OS === 'android') {
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA, {
              'title': 'Camera App Permission',
              'message': 'Camera App needs access to your camera '
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {

            that.setState({ QR_Code_Value: '' });
            that.setState({ Start_Scanner: true });
          } else {
            alert("CAMERA permission denied");
          }
        } catch (err) {
          alert("Camera permission err", err);
          console.warn(err);
        }
      }
      requestCameraPermission();
    } else {
      that.setState({ QR_Code_Value: '' });
      that.setState({ Start_Scanner: true });
    }
  }

  save = () => {
    this.storeData();
    console.log
    if (is_save == true) {
      this.setState({
        is_start: true
      })
      //const headerString = 'qrcode,timestamp\n';
      //const headerString = data2.map(dd => `${dd[0]},${dd[1]}\n`).join('');
      const rowString = values_temp.map(d => `${d[0]},${d[1]}\n`).join('');
      //const csvString = `${headerString}${rowString}`;
      const csvString = `${rowString}`;
      //////////////
      if (Platform.OS === 'android') {
        async function requestStoragePermission() {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
                'title': 'Storage App Permission',
                'message': 'Camera App needs access to your storage. '
              }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              if (Platform.OS === 'ios') {
                //let arr = fileUri.split('/')
                filePath = filesavepath
              } else {
                filePath = filesavepath;
              }
              console.log('pathToWrite', filePath);
              RNFetchBlob.fs
                .appendFile(filePath, csvString, 'utf8')
                .then(() => {
                  console.log(`wrote file ${filePath}`);
                  
                })
                .catch(error => console.error(error));
            } else {
              alert("STORAGE permission denied");
            }
          } catch (err) {
            //alert("STORAGE permission err", err);
            console.warn(err);
          }
        }
        requestStoragePermission();
      } else {
        if (Platform.OS === 'ios') {
          filePath = filesavepath
        } else {
          filePath = filesavepath;
        }
        console.log('pathToWrite', filePath);
        RNFetchBlob.fs
          .appendFile(filePath, csvString, 'utf8')
          .then(() => {
            console.log(`wrote file ${filePath}`);
            })
          .catch(error => console.error(error));
      }
    }
    is_save = false;
    values_temp = [];
    //sthis.getData();
  }


  sendmail = () => {
    this.setState({
      is_start: true
    })
    // const to = ['advancedaquire@gmail.com'] // string or array of email addresses
    // email(to, {
    //   // Optional additional arguments
    //   subject: 'Send QR code',
    //   body: 'select data.csv',
    //   attachment: {
    //     path: `${RNFetchBlob.fs.dirs.DocumentDir}/data.csv`,  // The absolute path of the file from which to read data.
    //     type: 'csv'   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
    //   }
    // }).catch(console.error)
    
      Mailer.mail({
        subject: 'send qrcode data',
        recipients: ['anthonnyberg@hotmail.com','advancedaquire@gmail.com','silverwing2019@outlook.com'],
        attachment: {
          path: filesavepath,  // The absolute path of the file from which to read data.
          type: 'doc',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
          name: 'qrscan.csv',   // Optional: Custom filename for attachment
        }
      }, (error, event) => {
        console.log(error);
      });
    
  }

  resetdata = () => {
    // this.state.is_exist = false;
    this.setState({
      is_start: true
    })
    data2 = [];
    values_temp = [];
    this.setState({
      is_exist: false
    })
    const values_null = [];
    const headerString = 'qrcode,timestamp\n';
    const rowString = values_null.map(d => `${d[0]},${d[1]}\n`).join('');
    // const csvString = `${headerString}${rowString}`;
    const csvString = `${rowString}`;
    if (Platform.OS === 'ios') {
      //let arr = fileUri.split('/')
      filePath = filesavepath
    } else {
      filePath = filesavepath;
    }
    console.log('pathToWrite', filePath);
    RNFetchBlob.fs
      .writeFile(filePath, csvString, 'utf8')
      .then(() => {
        console.log(`wrote file ${filePath}`);
        })
      .catch(error => console.error(error));
  }

  render() {
    if (!this.state.Start_Scanner && this.state.is_start) {
      // SoundPlayer.playSoundFile('correct', 'mp3');
      //this.state.is_start = false;
      return (
        <View style={styles.MainContainer} >
          {this.state.QR_Code_Value != '' &&
            <View>
              <View>
                <Text style={styles.QR_text}>
                  {'Scanned QR Code:'}
                </Text>
              </View>
              <View>
                <Text style={styles.QR_text}>{this.state.QR_Code_Value}</Text>
              </View>
            </View>}


          <TouchableOpacity
            onPress={this.open_QR_Code_Scanner}
            style={styles.button}>
            <Image
              source={require('./Images/scan.png')}
              style={styles.ImageIconStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.save}
            style={styles.button}>
            <Image
              source={require('./Images/ui-02.png')}
              style={styles.ImageIconStyle}
            />
          </TouchableOpacity>


          {/* 
            {this.state.QR_Code_Value.includes("http") ?
              <TouchableOpacity
                onPress={this.openLink_in_browser}
                style={styles.button}>
                <Text style={{ color: '#FFF', fontSize: 14 }}>Open Link in default Browser</Text>
              </TouchableOpacity> : null
            } */}


          <TouchableOpacity
            onPress={this.sendmail}
            style={styles.button}>
            <Image
              source={require('./Images/email.png')}
              style={styles.ImageIconStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.resetdata}
            style={styles.button}>
            <Image
              source={require('./Images/ui-03.png')}
              style={styles.ImageIconStyle}
            />
          </TouchableOpacity>
          <Image
            source={require('./Images/logo.jpg')}
            style={styles.ImageIconStyle_logo}
          />

        </View>
      )
    }
    if (!this.state.Start_Scanner && !(this.state.is_exist) && !(this.state.is_start)) {
      // SoundPlayer.playSoundFile('correct', 'mp3');
      return (

        <View style={styles.BlankContainer_blue}>

        </View>
      );
    }
    if (!this.state.Start_Scanner && this.state.is_exist && !(this.state.is_start)) {
      // SoundPlayer.playSoundFile('wrong', 'mp3');
      return (

        <View style={styles.BlankContainer_red}>

        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>

        <CameraKitCameraScreen
          showFrame={true}
          scanBarcode={true}
          laserColor={'#FF3D00'}
          frameColor={'#00C853'}
          colorForScannerFrame={'black'}
          onReadCode={event =>
            this.onQR_Code_Scan_Done(event.nativeEvent.codeStringValue)
          }
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({

  MainContainer: {
    flex: 1,
    paddingTop: (Platform.OS) === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  BlankContainer_blue: {
    flex: 1,
    paddingTop: (Platform.OS) === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
  },
  BlankContainer_red: {
    flex: 1,
    paddingTop: (Platform.OS) === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
  },
  QR_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    fontSize: 20,
    padding: 0,
    marginTop: 5,
    marginBottom: 0,
  },
  button: {
    // backgroundColor: '#2979FF',
    alignItems: 'center',
    padding: 12,
    width: 160,
    height: 40,
    marginBottom: 30
  },
  ImageIconStyle: {
    padding: 12,
    margin: 5,
    height: 40,
    width: 160,
    resizeMode: 'stretch',
  },
  ImageIconStyle_logo: {
    padding: 12,
    margin: 5,
    height: 90,
    width: 250,
    marginTop: 50,
    resizeMode: 'stretch',
  },
  TextStyle: {
    color: '#fff',
    marginBottom: 4,
    marginRight: 20,
  },
});


class CustomBlinkingTxt extends Component {
  constructor(props) {
    super(props);
    this.state = { showText: true };
    // Change the state every second or the time given by User.
    setInterval(() => {
      this.setState(previousState => {
        return { showText: !previousState.showText };
      });
    },
      // Define blinking time in milliseconds
      1000
    );
  }
  render() {
    let display = this.state.showText ? this.props.text : ' ';
    return (
      <Text style={{ textAlign: 'center', marginTop: 10, marginBottom: 10, fontSize: 18, color: '#f44336' }}>{display}</Text>
    );
  }
}
