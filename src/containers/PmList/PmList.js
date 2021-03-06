import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  AlertIOS,
  ScrollView
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import GiftedChatSendButton from '~/common/vendor/components/GiftedChatSendButton';
import GiftedChatLoadEarlierButton from '~/common/vendor/components/GiftedChatLoadEarlierButton';
import GiftedChatMessageText from '~/common/vendor/components/GiftedChatMessageText';
import LoadingSpinner from '~/components/LoadingSpinner/LoadingSpinner';
import {
  fetchPmList,
  cancelPmList,
  resetPmList,
  resetPmListResponseStatus
} from '~/modules/message/pmList/pmList.ducks';
import { PRIVATE_MESSAGE_POLL_FREQUENCY } from '~/config/app';
import api from '~/services/api';

import mainStyles from '~/common/styles/Main.style';
import styles from './PmList.style';

const __CURRENT_LOGIN_USER_ID__ = '__CURRENT_LOGIN_USER_ID__';

class PmList extends Component {
  static navigationOptions = ({ navigation }) => {
    const { title } = navigation.state.params;
    return {
      title
    };
  }

  constructor(props) {
    super(props);

    const { userId } = this.props.navigation.state.params;
    this.userId = userId;
    this.state = {
      messages: [],
      isPublishing: false
    };
  }

  componentDidMount() {
    this.fetchPmList();
    // Fetch new private messages every 20 secs.
    this.timer = setInterval(() => { this.fetchPmList(); }, 1000 * PRIVATE_MESSAGE_POLL_FREQUENCY);
  }

  componentWillUnmount() {
    this.props.cancelPmList();
    this.props.resetPmList();
    // Tear down timer.
    this.timer && clearInterval(this.timer);
  }

  fetchPmList() {
    this.props.fetchPmList({
      userId: this.userId,
      page: 1
    });
  }

  setUpTitle(newUserName) {
    const userName = this.props.pmList.user.name;
    if (userName !== newUserName) {
      this.props.navigation.setParams({ title: newUserName });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { pmList } = nextProps;
    this.setUpTitle(pmList.user.name);

    // Handle private messages.
    const { isPublishing } = this.state;

    if (isPublishing) { return; }

    if (pmList.isRefreshing)　{ return; }

    // Translation from Redux store props to component state.
    if (pmList.response && pmList.response.rs) {
      this.setState({
        messages: pmList.list
      });
      this.props.resetPmListResponseStatus();
    }
  }

  loadEarlierMessages(page) {
    this.props.fetchPmList({
      userId: this.userId,
      page
    });
  }

  onSend({ messages, toUserId }) {
    this.setState(previousState => {
      return {
        messages: GiftedChat.append(previousState.messages, Object.assign({}, messages[0], { isNew: true }))
      };
    });

    this.setState({ isPublishing: true });
    api.sendMessage({
      newMessage: messages[0],
      toUserId
    }).then(response => {
      if (response.error && response.error.message === 'Network request failed') {
        // No network.
        this.setState(previousState => {
          return {
            messages: previousState.messages.filter(message => !message.isNew)
          };
        });
        return;
      }

      const { rs, errcode } = response.data;
      if (rs) {
        // This is workaround to fix #14.
        // In produciton, sometimes the new sent message can not be displayed
        // in bubble list even it has been sent successfully, but it's very
        // hard to be reproduced in development mode. As we know, JavaScript
        // thread performance suffers greatly when running in development mode,
        // so the workaround can not only fix the weird issue here, but also can
        // give user a better ux with customized ticks `发送中...`, which seems
        // like the best solution now.
        setTimeout(() => { this.fetchPmList(); }, 1000 * 3);
      } else if (errcode) {
        // The time between sending two messages is too short.
        this.fetchPmList();
        AlertIOS.alert('提示', errcode);
      }
    }).finally(() => {
      this.setState({ isPublishing: false });
    });
  }

  render() {
    const {
      navigation,
      pmList: {
        isRefreshing,
        hasPrev,
        user,
        page
      }
    } = this.props;
    const { isPublishing } = this.state;

    if (isRefreshing && page === 0) {
      return (
        <LoadingSpinner />
      );
    }

    const messages = this.state.messages.map(item => {
      if (item.isNew) { return item; }

      return {
        _id: item.mid,
        text: item.content,
        createdAt: new Date(+item.time),
        user: {
          _id: (item.sender === user.id) && item.sender || __CURRENT_LOGIN_USER_ID__,
          avatar: (item.sender === user.id) && user.avatar
        }
      };
    });

    return (
      <View style={mainStyles.container}>
        <GiftedChat
          style={mainStyles.container}
          locale={'zh-cn'}
          placeholder='请输入私信内容'
          sendButtonLabel='发送'
          loadEarlierLabel='点击加载较早的消息'
          isLoadingEarlier={isRefreshing && page > 1}
          loadEarlier={hasPrev}
          renderAvatarOnTop={true}
          onLoadEarlier={() => this.loadEarlierMessages(page + 1)}
          onSend={messages => this.onSend({
            messages,
            toUserId: user.id
          })}
          renderSend={props => <GiftedChatSendButton {...props} />}
          renderLoadEarlier={props => <GiftedChatLoadEarlierButton {...props} />}
          renderMessageText={props => <GiftedChatMessageText {...props} />}
          renderTicks={message => {
            if (!message.isNew) { return; }

            return (
              <View style={styles.tickView}>
                {isPublishing && <Text style={styles.tick}>发布中...</Text>}
              </View>
            );
          }}
          messages={messages}
          user={{ _id: __CURRENT_LOGIN_USER_ID__ }} />
      </View>
    );
  }
}

function mapStateToProps({ pmList }) {
  return {
    pmList
  };
}

export default connect(mapStateToProps, {
  fetchPmList,
  cancelPmList,
  resetPmList,
  resetPmListResponseStatus
})(PmList);
