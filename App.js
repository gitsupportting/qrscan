import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, Platform, TouchableOpacity, Linking, PermissionsAndroid } from 'react-native';
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
import RNFetchBlob from 'rn-fetch-blob';

export default class App extends Component {
  constructor() {

    super();

    this.state = {

      QR_Code_Value: '',

      Start_Scanner: false,

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
    
    
    // const values = [
    //   ['build', '2017-11-05T05:40:35.515Z']
    //       ];
    const values = [];
    values.push([this.state.QR_Code_Value, (new Date()).toISOString()]);
    values.push([this.state.QR_Code_Value, (new Date()).toISOString()]);
    console.log(values);
    // construct csvString
    const headerString = 'qrcode,timestamp\n';
    const rowString = values.map(d => `${d[0]},${d[1]}\n`).join('');
    const csvString = `${headerString}${rowString}`;
    
    // write the current list of answers to a local csv file
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

          <Text style={{ fontSize: 22, textAlign: 'center' }}>Scan QR Code</Text>

          <Text style={styles.QR_text}>
            {this.state.QR_Code_Value ? 'Scanned QR Code: ' + this.state.QR_Code_Value : ''}
          </Text>

          {this.state.QR_Code_Value.includes("http") ?
            <TouchableOpacity
              onPress={this.openLink_in_browser}
              style={styles.button}>
              <Text style={{ color: '#FFF', fontSize: 14 }}>Open Link in default Browser</Text>
            </TouchableOpacity> : null
          }

          <TouchableOpacity
            onPress={this.open_QR_Code_Scanner}
            style={styles.button}>
            <Text style={{ color: '#000', fontSize: 20 }}>
              Open QR Scanner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.save}
            style={styles.button}>
            <Image
              source={require('./Images/ui-02.png')}
              style={styles.ImageIconStyle}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={this.open_QR_Code_Scanner}
            style={styles.button}>
            <Image
              source={require('./Images/ui-03.png')}
              style={styles.ImageIconStyle}
            />
          </TouchableOpacity> */}
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
  },
  QR_text: {
    color: '#000',
    fontSize: 19,
    padding: 8,
    marginTop: 12
  },
  button: {
    // backgroundColor: '#2979FF',
    alignItems: 'center',
    padding: 12,
    width: 200,
    height: 50,
    marginTop: 30
  },
  ImageIconStyle: {
    padding: 12,
    margin: 5,
    height: 50,
    width: 200,
    resizeMode: 'stretch',
  },
  TextStyle: {
    color: '#fff',
    marginBottom: 4,
    marginRight: 20,
  },
});
