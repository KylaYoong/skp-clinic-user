import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-config";
import "./TVQueueDisplay.css";


const TVQueueDisplay = () => {
  const [currentServing, setCurrentServing] = useState(null);
  const [upcomingPatients, setUpcomingPatients] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  // Announce the queue number
  const announceQueueNumber = (queueNumber) => {
    if ("speechSynthesis" in window) {
      // Format the queue number as "zero zero seven"
      const formattedQueueNumber = queueNumber
        .toString()
        .split("")
        .map((digit) => {
          if (digit === "0") return "zero";
          return digit;
        })
        .join(" ");
  
      // Play "ding dong" sound
      const audio = new Audio('/sounds/minimalist-ding-dong.wav');
    //   const audio = new Audio('/sounds/ding-dong.wav');
      audio.play();
  
      // Wait for the sound to finish before speaking
      audio.onended = () => {
        // English announcement
        // const englishUtterance = new SpeechSynthesisUtterance(`Now serving ${formattedQueueNumber}`);
        const englishUtterance = new SpeechSynthesisUtterance(`${formattedQueueNumber}`);
        englishUtterance.lang = "en-US";
        englishUtterance.rate = 0.1; // Slower pace
  
        // Malay announcement
        // const malayUtterance = new SpeechSynthesisUtterance(`Sekarang nombor ${queueNumber}`);
        const malayUtterance = new SpeechSynthesisUtterance(`${queueNumber}`);
        malayUtterance.lang = "ms-MY";
        malayUtterance.rate = 0.1; // Slower pace
  
        // Queue announcements
        window.speechSynthesis.speak(englishUtterance);
        window.speechSynthesis.speak(malayUtterance);
      };
    }
  };
  

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
          " " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  // Fetch real-time queue data
  useEffect(() => {
    const queueRef = collection(db, "queue");
    const q = query(queueRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0)); // Start of today
        const todayEnd = new Date(today.setHours(23, 59, 59, 999)); // End of today

        const patients = snapshot.docs
            .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            .filter((patient) => {
                const patientTimestamp = patient.timestamp?.toDate();
                return patientTimestamp >= todayStart && patientTimestamp <= todayEnd;
            });

        // First, find the currently serving patient
        const servingPatient = patients.find(
            (patient) => patient.status === "In Consultation"
        );

        // Get all completed patients
        const completedPatientsList = patients.filter(
            (patient) => patient.status === "Completed"
        );

        // Get queue numbers of completed and serving patients to exclude from waiting list
        const excludeQueueNumbers = new Set([
            ...completedPatientsList.map((p) => p.queueNumber),
            servingPatient?.queueNumber,
        ].filter(Boolean));

        // Filter waiting patients (exclude completed and serving patients)
        const waitingPatients = patients.filter(
            (patient) =>
                patient.status === "Waiting" &&
                !excludeQueueNumbers.has(patient.queueNumber)
        );

        // Sort completed patients by timestamp (newest first)
        completedPatientsList.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

        // Announce if there's a new serving patient
        if (servingPatient && servingPatient.queueNumber !== currentServing?.queueNumber) {
            console.log(`Announcing queue number ${servingPatient.queueNumber}`);
            announceQueueNumber(servingPatient.queueNumber);
        }

        // Update state
        setCurrentServing(servingPatient || null);
        setUpcomingPatients(waitingPatients);
        setCompletedPatients(completedPatientsList);
    });

    return () => unsubscribe();
}, [currentServing]);




  return (
    <div className="tv-display">
      <div className="header">
        <div className="date">{currentTime.split(" ")[0]}</div>
        <div className="time">{currentTime.split(" ").slice(1).join(" ")}</div>
      </div>

      <div className="main-container">
        <div className="horizontal-section">
          <div className="now-serving-horizontal">
            <h2>Now Serving (Sekarang Memanggil)</h2>
            <div className="queue-number">
              {currentServing ? currentServing.queueNumber : "None"}
            </div>
          </div>
        </div>

        <div className="waiting-completed">
          <div className="waiting-left-side">
            <div className="waiting-section">
              <h2>Waiting (Menunggu)</h2>
              {upcomingPatients.length > 0 ? (
                upcomingPatients.map((patient) => (
                  <div key={patient.id} className="queue-item">
                    {patient.queueNumber}
                  </div>
                ))
              ) : (
                <p>No waiting patients</p>
              )}
            </div>
          </div>

          <div className="completed-right-side">
            <div className="completed-section">
                <h2>Completed (Selesai)</h2>
                {completedPatients.length > 0 ? (
                completedPatients.map((patient) => (
                    <div key={patient.id} className="completed-item">
                    {patient.queueNumber}
                    </div>
                ))
                ) : (
                <p>No completed patients</p>
                )}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TVQueueDisplay;