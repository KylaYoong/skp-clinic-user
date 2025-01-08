import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-config";
import "./QueueStatus.css";

const QueueStatus = () => {
  const [queueNumber, setQueueNumber] = useState("N/A");
  const [currentServing, setCurrentServing] = useState("None");
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  
  useEffect(() => {
    // Get the employee ID from localStorage
    const userID = localStorage.getItem("employeeID");
    if (!userID) {
      alert("No employee ID found. Please register first!");
      return;
    }

    // Real-time listener for user queue details
    const queueRef = collection(db, "queue");
    const userQuery = query(queueRef, where("employeeID", "==", userID));

    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setQueueNumber(userData.queueNumber);

        if (userData.timestamp) {
          const timestamp = userData.timestamp.toDate();
          setDate(timestamp.toLocaleDateString());
          setTime(timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        } else {
          setDate("No Date");
          setTime("No Time");
        }
      } else {
        setQueueNumber("N/A");
      }
    });

    // Real-time listener for current serving
    const currentServingQuery = query(queueRef, where("status", "==", "being attended"));

    const unsubscribeServing = onSnapshot(currentServingQuery, (snapshot) => {
      if (!snapshot.empty) {
        const currentServingData = snapshot.docs[0].data();
        setCurrentServing(currentServingData.queueNumber || "No one is currently being served");
      } else {
        setCurrentServing("No one is currently being served");
      }
    });

    // Real-time listener for people ahead
    const aheadQuery = query(queueRef, where("status", "==", "waiting"));
    const unsubscribeAhead = onSnapshot(aheadQuery, (snapshot) => {
      const aheadCount = snapshot.docs.filter((doc) => doc.data().queueNumber < queueNumber).length;
      setPeopleAhead(aheadCount);
    });

    setLoading(false);

    // Cleanup listeners on component unmount
    return () => {
      unsubscribeUser();
      unsubscribeServing();
      unsubscribeAhead();
    };
  }, [queueNumber]);


  return (
    <div className="queue-status-page">
      <div className="queue-status-container">
        <h1>Your Ticket Number is</h1>
        {loading ? (
          <p>Loading your ticket...</p>
        ) : (
          <>
            <div className="ticket-details">
              <div className="current-serving-card">{queueNumber}</div>
            </div>
            <div className="current-serving">
              <p>Current Serving: {currentServing}</p>
              <p>There are <strong>{peopleAhead}</strong> people ahead of you</p>

            </div>
          </>
        )}
        <br />
        <p>Thank you for visiting our clinic</p>
        <br />
        <p>Stay safe, stay healthy</p>
        <div className="date-time">
          <span className="date">{date}</span>
          <span className="time">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
