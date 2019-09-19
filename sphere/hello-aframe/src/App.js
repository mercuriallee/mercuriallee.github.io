import 'aframe';
import React, { Component } from 'react';

class App extends Component {
  render () {
	  return (
		  <a-scene>
			  <a-sky material="src:imgs/PANO_20190830_161240.jpg"> </a-sky>
		  </a-scene>
	  );
  }
}

export default App;
