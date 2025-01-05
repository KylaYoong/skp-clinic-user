import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
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
    const fetchQueueStatus = async () => {
      try {
        setLoading(true);

        // Get the employee ID from localStorage
        const userID = localStorage.getItem("employeeID");
        console.log("Fetched employeeID from localStorage:", userID);

        if (!userID) {
          console.error("No employee ID found in localStorage.");
          setQueueNumber("N/A");
          setCurrentServing("None");
          setPeopleAhead(0);
          setLoading(false);
          return;
        }

        // Fetch user queue details
        const queueRef = collection(db, "queue");
        const userQuery = query(queueRef, where("employeeID", "==", userID));
        const userSnapshot = await getDocs(userQuery);

        console.log("Queue data for employee:", userSnapshot.docs.map(doc => doc.data()));

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setQueueNumber(userData.queueNumber);

          if (userData.timestamp) {
            const timestamp = userData.timestamp.toDate();
            setDate(timestamp.toLocaleDateString());
            setTime(timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          } else {
            setDate("No Date");
            setTime("No Time");
          }

          // Fetch the people ahead in the queue
          const peopleAheadQuery = query(queueRef, where("queueNumber", "<", userData.queueNumber));
          const peopleAheadSnapshot = await getDocs(peopleAheadQuery);
          setPeopleAhead(peopleAheadSnapshot.size);
        } else {
          console.warn("No queue data found for employee ID:", userID);
          setQueueNumber("N/A");
          setPeopleAhead(0);
        }

        // Query the queue collection for the current serving entry
        const currentServingQuery = query(queueRef, where("status", "==", "being attended"));
        const currentServingSnapshot = await getDocs(currentServingQuery);

        if (!currentServingSnapshot.empty) {
          const currentServingData = currentServingSnapshot.docs[0].data();
          setCurrentServing(currentServingData.queueNumber || "None");
        } else {
          setCurrentServing("None");
        }
      } catch (error) {
        console.error("Error fetching queue status:", error);
        setQueueNumber("Error");
        setCurrentServing("Error");
        setPeopleAhead(0);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
  }, []);

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
