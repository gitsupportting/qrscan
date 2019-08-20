import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, Platform, TouchableOpacity, Linking, PermissionsAndroid } from 'react-native';
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
import RNFetchBlob from 'rn-fetch-blob';
import email from 'react-native-email';

export default class App extends Component {
  constructor() {

    super();

    this.state = {

      QR_Code_Value: '',

      Start_Scanner: false,
      values: [],
      num: 0,
      // csvString: '',
    };
  }

  openLink_in_browser = () => {

    Linking.openURL(this.state.QR_Code_Value);

  }

  onQR_Code_Scan_Done = (QR_Code) => {

    this.setState({ QR_Code_Value: QR_Code });
    this.setState({ Start_Scanner: false });
  }

  open_QR_Code_Scanner = () => {

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
    // write the current list of answers to a local csv file
    var values_temp;
    values_temp = this.state.values;
    values_temp.push([this.state.QR_Code_Value, (new Date()).toISOString()]);
    console.log(values_temp[0][0]);
    const headerString = 'qrcode,timestamp\n';
    const rowString = values_temp.map(d => `${d[0]},${d[1]}\n`).join('');
    const csvString = `${headerString}${rowString}`;
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
              .writeFile(pathToWrite, csvString, 'utf8')
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
    //////////////


  }


  sendmail = () => {
    const to = ['advancedaquire@gmail.com'] // string or array of email addresses
    email(to, {
      // Optional additional arguments
      subject: 'Send QR code',
      body: 'select data.csv'
    }).catch(console.error)
  }

  resetdata = () => {
    const values_null = [];
    const headerString = 'qrcode,timestamp\n';
    const rowString = values_null.map(d => `${d[0]},${d[1]}\n`).join('');
    const csvString = `${headerString}${rowString}`;

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
    if (!this.state.Start_Scanner) {

      return (
        <View style={styles.MainContainer}>

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
    marginTop: 50,
  },
  QR_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    fontSize: 20,
    padding: 0,
    marginTop: 10,
    marginBottom: 10,
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
