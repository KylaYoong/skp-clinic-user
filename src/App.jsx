import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Register';
import QueueStatus from './QueueStatus';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/queue-status" element={<QueueStatus />} />
      </Routes>
    </Router>
  );
};

export default App;