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
  togglePanel = ()=>{
	  this.setState({showPanel: !this.state.showPanel})
  };
  render() {
	  return (
		  <View 
			style = {{
			  width: 600,
			  height: 450,
			  backgroundColor: `rgba(255, 255, 255, ${this.state.showPanel ? 0.4 : 0})`, 
			  alignItems: 'center',
			  justifyContent: 'space-between'
			}}
			  onInput={e=>e.nativeEvent.inputEvent.action == 'down' && this.togglePanel()}
		  >
		    {this.state.showPanel && (
				<VrButton style={styles.selection}>
			  <Text style={{fontSize: 30}}> 
				SELECT PIC 
			  </Text>
			</VrButton>
			)}
			
		    {this.state.showPanel && (
			<Text style={styles.info}>
			  click Button to change panadrama picture to view.
			  Touch here to hide..
			</Text>
			)}
	    </View>
	  )}
};

const styles = StyleSheet.create({
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
