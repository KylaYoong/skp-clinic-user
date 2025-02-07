import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase-config";
import "./TVQueueDisplay.css";

const TVQueueDisplay = () => {
  const [currentServing, setCurrentServing] = useState(null);
  const [upcomingPatients, setUpcomingPatients] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  const announceQueueNumber = (queueNumber) => {
    if ("speechSynthesis" in window) {
      const formattedQueueNumber = queueNumber
        .toString()
        .split("")
        .map((digit) => (digit === "0" ? "zero" : digit))
        .join(" ");

      const audio = new Audio("/sounds/minimalist-ding-dong.wav");
      audio.play();

      audio.onended = () => {
        const englishUtterance = new SpeechSynthesisUtterance(`${formattedQueueNumber}`);
        englishUtterance.lang = "en-US";
        englishUtterance.rate = 0.6;

        const malayUtterance = new SpeechSynthesisUtterance(`${queueNumber}`);
        malayUtterance.lang = "ms-MY";
        malayUtterance.rate = 0.6;

        window.speechSynthesis.speak(englishUtterance);
        window.speechSynthesis.speak(malayUtterance);
      };
    }
  };

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

  useEffect(() => {
    const queueRef = collection(db, "queue");
    const q = query(queueRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));

      const patients = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((patient) => {
          const patientTimestamp = patient.timestamp?.toDate();
          return patientTimestamp >= todayStart && patientTimestamp <= todayEnd;
        });

      const servingPatient = patients.find((patient) => patient.status === "In Consultation");

      const completedPatientsList = patients.filter((patient) => patient.status === "Completed");

      const excludeQueueNumbers = new Set([
        ...completedPatientsList.map((p) => p.queueNumber),
        servingPatient?.queueNumber,
      ].filter(Boolean));

      const waitingPatients = patients.filter(
        (patient) =>
          patient.status === "Waiting" && !excludeQueueNumbers.has(patient.queueNumber)
      );

      completedPatientsList.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

      if (servingPatient && servingPatient.queueNumber !== currentServing?.queueNumber) {
        console.log(`Announcing queue number ${servingPatient.queueNumber}`);
        announceQueueNumber(servingPatient.queueNumber);
      }

      setCurrentServing(servingPatient || null);
      setUpcomingPatients(waitingPatients);
      setCompletedPatients(completedPatientsList);
    });

    return () => unsubscribe();
  }, [currentServing]);

  // Listen for announcements and play the sound
  useEffect(() => {
    const announcementDocRef = doc(db, "announcements", "latest");
    
    const unsubscribe = onSnapshot(announcementDocRef, (doc) => {
      if (doc.exists()) {
        const { queueNo } = doc.data();
        if (queueNo) {
          announceQueueNumber(queueNo); // Play the announcement sound
          setCurrentServing({ queueNumber: queueNo }); // Update display
        } else {
          setCurrentServing(null); // Reset if no announcement
        }
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  

  return (
    <div className="tv-display">
      <div className="header">
        <div className="date">{currentTime.split(" ")[0]}</div>
        <div className="time">{currentTime.split(" ").slice(1).join(" ")}</div>
      </div>

      <div className="main-container">
        <div className="horizontal-section">
          <div className="now-serving-horizontal">
            <h2>Current Queue Number</h2>
            <h3>Nombor Giliran Sekarang</h3>=
            <div className="queue-number">
              {currentServing ? currentServing.queueNumber : "None"}
            </div>
          </div>
        </div>

        <div className="waiting-completed">
          <div className="waiting-left-side">
          <div className="waiting-section">
            <h2>Menunggu</h2>
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
            <h2>Selesai</h2>
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
