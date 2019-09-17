import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  VrButton,
} from 'react-360';

export default class sphere extends React.Component {
  state = {showPanel: true};
  togglePanel = ()=>{ this.setState({showPanel: !this.state.showPanel})};
  render() {
	  return this.state.showPanel ? (
		  <VrButton style={styles.panel} onClick={this.togglePanel}>
			<VrButton style={styles.selection}>
			  <Text style={{fontSize: 30}}> 
				SELECT PIC 
			</Text>
			</VrButton>
			
			<Text style={styles.info}>
			  click Button to change panadrama picture to view.
			  Touch here to hide..
			</Text>
		  </VrButton>
	) : null;
  }
};

const styles = StyleSheet.create({
  panel: {
    // Fill the entire surface
    width: 600,
    height: 450,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selection: {
	  top: '20%',
	  width: 300,
	  height: 40,
	  borderWidth: 3,
	  flexDirection: 'column',
	  alignItems: 'center',
  },
  info: {	
	  fontSize: 24,
	  bottom: '30%',
  }
});

AppRegistry.registerComponent('sphere', () => sphere);
