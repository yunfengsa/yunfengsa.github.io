import React from 'react';
import TopBar from './components/topBar/index';
import Content from './components/content';
import Canvas from './components/canvas/logo';
import contentStore from './models/content';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.contentStore = new contentStore();
  }

  render() {
    return <div>
      <TopBar />
      <Canvas />
      <Content store={this.contentStore} />
    </div>
  }
}

