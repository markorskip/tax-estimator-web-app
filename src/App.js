import React from 'react';

import './App.css';
import TaxDataInputForm from "./Form";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Tax Estimator
        </p>
        <TaxDataInputForm/>
      </header>
    </div>
  );
}

export default App;
