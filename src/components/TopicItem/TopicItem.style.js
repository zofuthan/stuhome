import { StyleSheet } from 'react-native';
import colors from '~/common/styles/colors.style';

export default StyleSheet.create({
  container: {
    borderBottomWidth: 6,
  },
  item: {
    margin: 10
  },
  row: {
    flexDirection: 'row',
  },
  left: {
    marginRight: 8
  },
  right: {
    flex: 1,
    flexDirection: 'row',
  },
  name: {
    fontWeight: '400',
  },
  date: {
    fontSize: 11,
    marginTop: 5,
  },
  title: {
    marginTop: 8,
  },
  subject: {
    marginTop: 5,
  },
  leftInfo: {
    flex: 1,
  },
  rightInfo: {
    flex: 1,
  },
  forumBorder: {
    backgroundColor: colors.lightBlue,
    borderRadius: 2,
    padding: 3,
    marginBottom: 5,
  },
  forumName: {
    color: colors.white,
    fontSize: 12,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  avatar: {
    height: 35,
    width: 35,
    borderRadius: 5
  },
  viewsInfo: {
    textAlign: 'left',
  },
  commentsInfo: {
    marginLeft: 5,
    textAlign: 'left',
  },
});
