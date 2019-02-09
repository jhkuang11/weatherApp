import React from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SocketIOClient from 'socket.io-client';

import getImageForWeather from './utils/getImageForWeather';

import SearchInput from './components/SearchInput';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: '',
      weather: '',
      degree: '',
    };
    this.socket = SocketIOClient('http://localhost:8080');
    this.socket.on('UpdateWeatherInfo', this.handleDisplayChangge.bind(this));
    this.socket.on('dataUpdate', this.handleNewDataUpdate.bind(this));
  }

  handleNewDataUpdate = updateinfo => {
    const {location, condition, degree} = updateinfo;
    if (location === this.state.location){
      this.setState({
        weather: condition,
        degree: degree,
      });
    }
    
  }

  handleDisplayChangge = returnedData => {
    const {location, condition, degree} = returnedData;
    this.setState({ 
      location: location,
      weather: condition,
      degree: degree,
    });
  }

  handleUpdateLocation = city => {
    this.socket.emit('UpdateCity', city);
  };

  render() {
    const { location, weather, degree } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ImageBackground
          source={getImageForWeather(weather)}
          style={styles.imageContainer}
          imageStyle={styles.image}
        >
          <View style={styles.detailsContainer}>
            <Text style={[styles.largeText, styles.textStyle]}>{location}</Text>
            <Text style={[styles.smallText, styles.textStyle]}>{weather}</Text>
            <Text style={[styles.largeText, styles.textStyle]}>{degree}</Text>

            <SearchInput
              placeholder="Search any city"
              onSubmit={this.handleUpdateLocation}
            />
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495E',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
  },
  textStyle: {
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Roboto',
    color: 'white',
  },
  largeText: {
    fontSize: 44,
  },
  smallText: {
    fontSize: 18,
  },
});

