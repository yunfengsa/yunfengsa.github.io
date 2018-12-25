import React from 'react';
import ReactDOM from 'react-dom';
import Hello from './Hello';
import styles from './style.scss';
let HelloWorld = () => {
  return [
    <h1 className={styles.container}>welcome to my house!</h1>,
    <Hello />
  ]
}

ReactDOM.render(<HelloWorld />, document.getElementById('root'));