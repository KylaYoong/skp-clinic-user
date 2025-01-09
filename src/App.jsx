import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Register';
import QueueStatus from './QueueStatus';
import TVQueueDisplay from "./TVQueueDisplay";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/queue-status" element={<QueueStatus />} />

        {/* TV Queue Display */}
        <Route path="/tv-queue-display" element={<TVQueueDisplay />} />
      </Routes>
    </Router>
  );
};

export default App;