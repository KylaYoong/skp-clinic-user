import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-config";
import "./QueueStatus.css";

const QueueStatus = () => {
  const [queueNumber, setQueueNumber] = useState("N/A");
  const [currentServing, setCurrentServing] = useState("None");
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [userQueueNumber, setUserQueueNumber] = useState(null); // State for user's queue number

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

    // Listener for user's queue details
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        const queueNum = parseInt(userData.queueNumber, 10); // Parse queue number as a number
        setUserQueueNumber(queueNum); // Update state with the queue number
        setQueueNumber(userData.queueNumber); // Keep leading zeros

        if (userData.timestamp) {
          const timestamp = userData.timestamp.toDate();
          setDate(timestamp.toLocaleDateString());
          setTime(
            timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        } else {
          setDate("No Date");
          setTime("No Time");
        }
      } else {
        setQueueNumber("N/A");
        setUserQueueNumber(null); // Reset state if no queue number
      }
    });

    // Listener for current serving number
    const currentServingQuery = query(queueRef, where("status", "==", "In Consultation"));
    const unsubscribeServing = onSnapshot(currentServingQuery, (snapshot) => {
      console.log("Current Serving Snapshot:", snapshot.docs);
      if (!snapshot.empty) {
        const currentServingData = snapshot.docs[0].data();
        console.log("Current Serving Data:", currentServingData);
        setCurrentServing(currentServingData.queueNumber || "None");
      } else {
        setCurrentServing("None");
      }
    });

    setLoading(false);

    // Cleanup listeners on component unmount
    return () => {
      unsubscribeUser();
      unsubscribeServing();
    };
  }, []); // Empty dependency array ensures listeners are set up only once


  // Listener for current serving number
  useEffect(() => {
    const queueRef = collection(db, "queue");

    // Use Firestore's Timestamp to query by today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const currentServingQuery = query(
      queueRef,
      where("timestamp", ">=", startOfDay), // Filter by today's date
      where("timestamp", "<=", endOfDay),
      where("status", "==", "In Consultation") // Filter by status
    );

    const unsubscribeServing = onSnapshot(currentServingQuery, (snapshot) => {
      console.log("Current Serving Snapshot:", snapshot.docs);
      if (!snapshot.empty) {
        const currentServingData = snapshot.docs[0].data();
        console.log("Current Serving Data:", currentServingData);
        setCurrentServing(currentServingData.queueNumber || "None");
      } else {
        setCurrentServing("None");
      }
    });

    return () => unsubscribeServing(); // Clean up listener on unmount
  }, []); // Empty dependency array ensures this runs once


    // Listener for people ahead number
  useEffect(() => {
    const queueRef = collection(db, "queue");
  
    if (userQueueNumber !== null) {
      // Use Firestore's Timestamp to query by today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
      const aheadQuery = query(
        queueRef,
        where("timestamp", ">=", startOfDay),
        where("timestamp", "<=", endOfDay),
        where("status", "==", "Waiting")
      );
  
      const unsubscribeAhead = onSnapshot(aheadQuery, (snapshot) => {
        console.log("Ahead Query Snapshot:", snapshot.docs);
        if (snapshot.empty) {
          console.warn("No documents match the query.");
          setPeopleAhead(0);
          return;
        }
  
        const formattedUserQueueNumber = userQueueNumber.toString().padStart(3, "0"); // Ensure zero-padding consistency
        const aheadCount = snapshot.docs.reduce((count, doc) => {
          const data = doc.data();
          const otherQueueNumber = data.queueNumber.padStart(3, "0"); // Keep queue numbers as strings
          console.log(
            "Comparing Other Queue Number:",
            otherQueueNumber,
            "with User Queue Number:",
            formattedUserQueueNumber
          );
  
          return otherQueueNumber < formattedUserQueueNumber ? count + 1 : count;
        }, 0);
  
        console.log("Final People Ahead Count:", aheadCount);
        setPeopleAhead(aheadCount);
      });
  
      return () => unsubscribeAhead(); // Clean up listener on unmount
    } else {
      setPeopleAhead(0);
    }
  }, [userQueueNumber]);
  

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
              <p>Current Serving: <strong>{currentServing}</strong></p>
              <p>There are <strong>{peopleAhead}</strong> people ahead of you</p>
            </div>
          </>
        )}
        <br />
        <p>Thank you for visiting our clinic</p>
        <br />
        <p>Stay safe, stay healthy</p>
        <div className="date-time">
        <span className="date" style={{ fontSize: "20px" }}>{date}</span>
        <span className="time" style={{ fontSize: "20px" }}>{time}</span>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;