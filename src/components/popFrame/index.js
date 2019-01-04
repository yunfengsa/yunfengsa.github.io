import React from 'react';
import { observer } from "mobx-react";
import styles from './index.scss';

const PopFrame = (props) => {
  if (props.store.src) {
    console.log(123)
    return(
    <div className={styles.root}>
      <iframe className={styles.iframe} src={props.store.src} />,
      <button className={styles.button} onClick={props.store.closeIframe}>关闭</button>
    </div>
    )
  } else {
    console.log(4)
    return null;
  }
}

export default observer(PopFrame);