return (
    <div className="tv-display">
      <div className="header">
        <img src="/images/SKPBM-LOGO.PNG" alt="SKP BM Logo" />
        <div className="date">{currentTime.split(" ")[0]}</div>
        <div className="time">{currentTime.split(" ").slice(1).join(" ")}</div>
      </div>

      <div className="main-container">
        <div className="horizontal-section">
          <div className="now-serving-horizontal">
            <h2>Current Queue Number</h2>
            <h3>Nombor Giliran Sekarang</h3>
            <div className="queue-number">
              {currentServing ? currentServing.queueNumber : "None"}
            </div>
          </div>
        </div>

        <div className="waiting-completed">
          <div className="waiting-left-side">
          <div className="waiting-section">
            <h2>Now Waiting</h2>
            <h3>Tunggu Giliran</h3>
            {Array.isArray(upcomingPatients) && upcomingPatients.length > 0 &&
              upcomingPatients.map((patient) => (
                <div key={patient.id} className="queue-item">
                  {patient.queueNumber}
                </div>
              ))
            }
          </div>
          </div>

          <div className="completed-right-side">
          <div className="completed-section">
            <h2>Completed</h2>
            <h3>Selesai</h3>
            {Array.isArray(completedPatients) && completedPatients.length > 0 &&
              completedPatients.map((patient) => (
                <div key={patient.id} className="completed-item">
                  {patient.queueNumber}
                </div>
              ))
            }
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVQueueDisplay;
