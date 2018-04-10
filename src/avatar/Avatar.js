import PropTypes from 'prop-types';
import React from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';

import Icon from '../icons/Icon';
import ViewPropTypes from '../config/ViewPropTypes';

const DEFAULT_COLORS = ['#000', '#333', '#555', '#888', '#aaa', '#ddd'];

const Avatar = ({
  component,
  onPress,
  onLongPress,
  containerStyle,
  icon,
  iconStyle,
  source,
  small,
  medium,
  large,
  xlarge,
  avatarStyle,
  rounded,
  title,
  titleStyle,
  overlayContainerStyle,
  activeOpacity,
  showEditButton,
  editButton,
  onEditPress,
  imageProps,
  placeholderStyle,
  PlaceholderContent: PlaceholderContentProp,
  ...attributes
}) => {
  const Component = onPress || onLongPress ? TouchableOpacity : View
  let {  width, height } = attributes
  if (small) {
    width = 34;
    height = 34;
  } else if (medium) {
    width = 50;
    height = 50;
  } else if (large) {
    width = 75;
    height = 75;
  } else if (xlarge) {
    width = 150;
    height = 150;
  } else if (!width && !height) {
    width = 34;
    height = 34;
  } else if (!width) {
    width = height;
  } else if (!height) {
    height = width;
  }
  const titleSize = width / 2;
  const iconSize = width / 2;

  const renderUtils = () => {
    if (showEditButton) {
      const editButtonProps = { ...editButton };
      const defaultEditButtonSize = (width + height) / 2 / 3;
      const editButtonSize = editButton.size || defaultEditButtonSize;
      const editButtonSizeStyle = {
        width: editButtonSize,
        height: editButtonSize,
        borderRadius: editButtonSize / 2,
      };
      const editButtonIconSize = editButtonSize * 0.8;
      return (
        <TouchableHighlight
          style={[
            styles.editButton,
            editButtonSizeStyle,
            editButtonProps.style,
          ]}
          underlayColor={editButtonProps.underlayColor}
          onPress={onEditPress}
        >
          <View>
            <Icon
              size={editButtonIconSize}
              name={editButtonProps.iconName}
              type={editButtonProps.iconType}
              color={editButtonProps.iconColor}
            />
          </View>
        </TouchableHighlight>
      );
    }
    return null
  };

  const PlaceholderContent = PlaceholderContentProp
    || (title &&
      <Text style={[styles.title, { fontSize: titleSize }, titleStyle]}>
        {title}
      </Text>)
    || (icon &&
      <Icon
        style={iconStyle && iconStyle}
        color={icon.color || 'white'}
        name={icon.name || 'user'}
        size={icon.size || iconSize}
        type={icon.type && icon.type}
      />)

  return (
    <Component
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={activeOpacity}
      style={[
        styles.container,
        { height, width },
        rounded && { borderRadius: width / 2 },
        containerStyle,
      ]}
      {...attributes}
    >
      <FadeInImage
        placeholderStyle={placeholderStyle}
        PlaceholderContent={PlaceholderContent}
        containerStyle={[
          rounded && { borderRadius: width / 2 },
          overlayContainerStyle,
        ]}
        source={source}
        {...imageProps}
        style={[
          { height, width },
          rounded && { borderRadius: width / 2 },
          imageProps && imageProps.style,
          avatarStyle,
        ]}
      />
      {renderUtils()}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  avatar: {
    flex: 1,
    width: null,
    height: null,
  },
  overlayContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DEFAULT_COLORS[4],
    ...Platform.select({
      ios: {
        shadowColor: DEFAULT_COLORS[0],
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BDBDBD',
  },
});

Avatar.propTypes = {
  component: PropTypes.oneOf([
    View,
    TouchableOpacity,
    TouchableHighlight,
    TouchableNativeFeedback,
    TouchableWithoutFeedback,
  ]),
  width: PropTypes.number,
  height: PropTypes.number,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
  containerStyle: PropTypes.any,
  source: Image.propTypes.source,
  avatarStyle: PropTypes.any,
  rounded: PropTypes.bool,
  title: PropTypes.string,
  titleStyle: Text.propTypes.style,
  overlayContainerStyle: PropTypes.any,
  activeOpacity: PropTypes.number,
  icon: PropTypes.object,
  iconStyle: Text.propTypes.style,
  small: PropTypes.bool,
  medium: PropTypes.bool,
  large: PropTypes.bool,
  xlarge: PropTypes.bool,
  showEditButton: PropTypes.bool,
  onEditPress: PropTypes.func,
  editButton: PropTypes.shape({
    size: PropTypes.number,
    iconName: PropTypes.string,
    iconType: PropTypes.string,
    iconColor: PropTypes.string,
    underlayColor: PropTypes.string,
    style: ViewPropTypes.style,
  }),
  placeholderStyle: ViewPropTypes.style,
  PlaceholderContent: PropTypes.node,
  imageProps: PropTypes.object,
};

Avatar.defaultProps = {
  showEditButton: false,
  onEditPress: null,
  editButton: {
    size: null,
    iconName: 'mode-edit',
    iconType: 'material',
    iconColor: '#fff',
    underlayColor: DEFAULT_COLORS[0],
    style: null,
  },
};

class FadeInImage extends React.PureComponent {
  placeholderContainerOpacity = new Animated.Value(1)

  onLoadEnd = () => {
    /* Images finish loading in the same frame for some reason,
      the images will fade in separately with staggerNonce */
    const minimumWait = 100;
    const staggerNonce = 200 * Math.random();
    setTimeout(() =>
      Animated.timing(this.placeholderContainerOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(), minimumWait + staggerNonce);
  }

  render() {
    const { placeholderStyle, PlaceholderContent, containerStyle, style, ...attributes } = this.props
    return Platform.OS === 'ios' ? (
      <View style={[styles.overlayContainer, containerStyle]}>
        <Image {...attributes} onLoadEnd={this.onLoadEnd} style={[styles.avatar, style]} />
        <Animated.View style={[styles.placeholderContainer, { opacity: this.placeholderContainerOpacity }]}>
          <View style={[style, styles.placeholder, placeholderStyle]}>
            {PlaceholderContent}
          </View>
        </Animated.View>
      </View>
    ) : (
      <View style={[styles.overlayContainer, containerStyle]}>
        <View style={styles.placeholderContainer}>
          <View style={[style, styles.placeholder, placeholderStyle]}>
            {PlaceholderContent}
          </View>
        </View>
        <Image {...attributes} style={[styles.avatar, style]} />
      </View>
    )
  }
}

export default Avatar;
