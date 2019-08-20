import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, Platform, TouchableOpacity, Linking, PermissionsAndroid } from 'react-native';
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
import RNFetchBlob from 'rn-fetch-blob';
import email from 'react-native-email';
import SoundPlayer from 'react-native-sound-player';
var num = 0;
var values_temp = [];
var is_start = true;
var data2 = [];
export default class App extends Component {
  constructor() {

    super();

    this.state = {

      QR_Code_Value: '',

      Start_Scanner: false,
      values: [],
      is_exist: false,
      showView: false,
    };

    setInterval(() => {
      this.setState(previousState => {
        return { showView: !previousState.showView };
      });
    },
      // Define blinking time in milliseconds
      2000
    );
    this.init();
  }
  init = () => {
    var filePath;
    if (Platform.OS === 'ios') {
      let arr = fileUri.split('/')
      const dirs = RNFetchBlob.fs.dirs
      filePath = `${dirs.DownloadDir}/${arr[arr.length - 1]}`
    } else {
      filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
    }
    // const filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
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
    is_start = false;
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



    // fileUri is a string like "file:///var/mobile/Containers/Data/Application/9B754FAA-2588-4FEC-B0F7-6D890B7B4681/Documents/filename"

  }

  save = () => {

    // // write the current list of answers to a local csv file
    // var values_temp;
    // values_temp = this.state.values;
    // values_temp.push([this.state.QR_Code_Value, (new Date()).toISOString()]);
    // // this.state.values = values_temp;
    // var i;
    // // this.state.is_exist = false;
    // this.setState({
    //   is_exist: false
    // })
    // num = num + 1;
    // for (i = 0; i < num; i++) {
    //   if (((num > 1) && (i > 0) && values_temp[i - 1][0] == this.state.QR_Code_Value) || ((num > 1) && (values_temp[0][0] == this.state.QR_Code_Value))) {
    //     // this.state.is_exist = true;
    //     this.setState({
    //       is_exist: true
    //     })
    //     return;
    //   }
    //   // if (this.state.is_exist == true) break;
    // }
    // if (this.state.is_exist == true) {
    //   num = num - 1;
    //   values_temp.pop([this.state.QR_Code_Value, values_temp[num][1]]);
    // }
    // console.log(this.state.is_exist);
    // console.log(values_temp);
    is_start = true;
    const headerString = 'qrcode,timestamp\n';
    const rowString = values_temp.map(d => `${d[0]},${d[1]}\n`).join('');
    // const csvString = `${headerString}${rowString}`;
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

            const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
            console.log('pathToWrite', pathToWrite);
            // pathToWrite /storage/emulated/0/Download/data.csv
            RNFetchBlob.fs
              .appendFile(pathToWrite, csvString, 'utf8')
              .then(() => {
                console.log(`wrote file ${pathToWrite}`);
                // wrote file /storage/emulated/0/Download/data.csv
              })
              .catch(error => console.error(error));
          } else {
            alert("STORAGE permission denied");
          }
        } catch (err) {
          alert("STORAGE permission err", err);
          console.warn(err);
        }
      }
      requestStoragePermission();
    } else {
      const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
      console.log('pathToWrite', pathToWrite);
      // pathToWrite /storage/emulated/0/Download/data.csv
      RNFetchBlob.fs
        .writeFile(pathToWrite, csvString, 'utf8')
        .then(() => {
          console.log(`wrote file ${pathToWrite}`);
          // wrote file /storage/emulated/0/Download/data.csv
        })
        .catch(error => console.error(error));
    }
  }


  sendmail = () => {
    is_start = true;
    const to = ['advancedaquire@gmail.com'] // string or array of email addresses
    email(to, {
      // Optional additional arguments
      subject: 'Send QR code',
      body: 'select data.csv'
    }).catch(console.error)
  }

  resetdata = () => {
    // this.state.is_exist = false;
    is_start = true;
    values_temp = [];
    this.setState({
      is_exist: false
    })
    const values_null = [];
    const headerString = 'qrcode,timestamp\n';
    const rowString = values_null.map(d => `${d[0]},${d[1]}\n`).join('');
    // const csvString = `${headerString}${rowString}`;
    const csvString = `${rowString}`;

    const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
    console.log('pathToWrite', pathToWrite);
    // pathToWrite /storage/emulated/0/Download/data.csv
    RNFetchBlob.fs
      .writeFile(pathToWrite, csvString, 'utf8')
      .then(() => {
        console.log(`wrote file ${pathToWrite}`);
        // wrote file /storage/emulated/0/Download/data.csv
      })
      .catch(error => console.error(error));
  }

  render() {
    if (!this.state.Start_Scanner && is_start) {
      // SoundPlayer.playSoundFile('correct', 'mp3');
      //is_start = false;
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
    if (!this.state.Start_Scanner && !(this.state.is_exist) && !(is_start)) {
      // SoundPlayer.playSoundFile('correct', 'mp3');
      return (
        this.state.showView ? (
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
        ) :
          (<View style={styles.BlankContainer_blue}>

          </View>)




      );
    }
    if (!this.state.Start_Scanner && this.state.is_exist && !(is_start)) {
      // SoundPlayer.playSoundFile('wrong', 'mp3');
      return (
        this.state.showView ? (
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
        ) :
          (<View style={styles.BlankContainer_red}>

          </View>)




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
    backgroundColor: 'blue',
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
