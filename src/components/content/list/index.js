import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

const styles = {
  container: {
    zIndex: 999,
    width: '100%',
    background: 'linear-gradient(#28f, #03a)',
    position: 'relative',
    overflow: 'auto',
    height: 300,
  },
  img: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
}

const list = (props) => {
  const {list, classes} = props;

  return (
    <List className={classes[`container`]}>
      {list && list.map(_ => (
        <ListItem>
          <ListItemText primary={_.title} secondary={_.subTitle} />
        </ListItem>
      ))}
    </List>
  )
}

export default withStyles(styles)(list);