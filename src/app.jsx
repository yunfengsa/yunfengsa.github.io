import React from 'react';
import TopBar from './components/topBar/index';
import Content from './components/content';
import Canvas from './components/canvas/logo';
export default () => {
  return <div>
      <TopBar />
      <Canvas />
      <Content />
    </div>
}