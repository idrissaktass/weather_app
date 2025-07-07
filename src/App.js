import './App.css';
import React from 'react';
import { Grid } from '@mui/material';
import MainScreen from './components/MainScreen';
import Navbar from './components/Navbar';

function App() {

  return (
    <div className="App">
      <Navbar/>
      <Grid>
        <Grid>
          <MainScreen/>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
