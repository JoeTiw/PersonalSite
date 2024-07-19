import logo from './logo.svg';
import './App.css';
import { Typography } from '@mui/material';
import HomePage from './HomePage';
import Navbar from './NavBar/Navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <HomePage/>
    </div>
  );  
}

export default App;
