import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import { observer } from "mobx-react";

import SubList from './list';

const styles = theme => ({
  root: {
    marginTop: 50,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  gridList: {
    width: '100%',
    height: '100%',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
});
@observer
class TitlebarGridList extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.store.fetchInfo();
  }
  
  render() {
    const { classes } = this.props;
    const store = this.props.store;
    return (
      <div className={classes.root}>
        <GridList spacing={100} cellHeight={180} cols={2} className={classes.gridList}>
          <GridListTile key="0"> 
            <SubList list={store.infoList} />
          </GridListTile>
          <GridListTile key="0"> 
            <SubList list={store.infoList} />
          </GridListTile>
        </GridList>
        {/* <SubList list={store.infoList} /> */}
      </div>
    );
  }
  
}

TitlebarGridList.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default (withStyles(styles)(TitlebarGridList));


// <GridListTile key={tile.img}>
            //   <img src="http://lorempixel.com/400/200/" alt={tile.title} />
            //   <GridListTileBar
            //     title={tile.title}
            //     subtitle={tile.subTitle}
            //     actionIcon={
            //       <IconButton className={classes.icon}>
            //         <InfoIcon />
            //       </IconButton>
            //     }
            //   />
            // </GridListTile>