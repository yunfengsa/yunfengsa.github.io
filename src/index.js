import React from 'react';
import ReactDOM from 'react-dom';
let HelloWorld = () => {
  return [
    <h1>welcome to my house!</h1>,
  ]
}

ReactDOM.render(<HelloWorld />, document.getElementById('root'));