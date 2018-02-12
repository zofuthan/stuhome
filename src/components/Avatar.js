import React, { Component } from 'react';
import {
  View,
  TouchableOpacity
} from 'react-native';
import { CachedImage } from 'react-native-img-cache';
import styles from '../styles/components/_Avatar';
import colors from '../styles/common/_colors';

export default class Avatar extends Component {
  render() {
    let {
      style,
      url,
      onPress,
      navigation,
      userId,
      userName,
      currentUserId
    } = this.props;

    return (
      <TouchableOpacity
        underlayColor={colors.underlay}
        onPress={() => {
          if (onPress) {
            onPress();
            return;
          }

          // Cases for avatar could not be clicked to redirect.
          // 1. No login user
          // 2. Same user (in individual page)
          if (!currentUserId || !userId || userId.toString() === currentUserId.toString()) { return; }

          navigation.navigate('Individual', {
            userId,
            userName,
            currentUserId
          });
        }}>
        <View>
          <CachedImage
            style={[styles.avatar, style]}
            source={{ uri: url }} />
        </View>
      </TouchableOpacity>
    );
  }
}
