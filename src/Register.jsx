import React, { useState } from "react";
import { db } from "./firebase-config";
import { collection, doc, setDoc, Timestamp, query, getDocs, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [id, setId] = useState(""); // Employee ID
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id.match(/^\d{6}$/)) {
      alert("Employee ID must be exactly 6 digits!");
      return;
    }

    try {
      // Query the employees collection
      const employeesCollection = collection(db, "employees");
      const employeeQuery = query(employeesCollection, where("employeeID", "==", id));
      const employeeSnapshot = await getDocs(employeeQuery);

      console.log("Employee Query Results:", employeeSnapshot.docs.map((doc) => doc.data()));

      // Check if the Employee ID exists
      if (employeeSnapshot.empty) {
        alert("Invalid Employee ID! You are not a verified employee.");
        return;
      }

      // Retrieve employee data (optional)
      const employeeData = employeeSnapshot.docs[0].data();
      console.log("Employee Data Retrieved:", employeeData);

      // Queue management
      const queueCollection = collection(db, "queueMeta");
      const queueSnapshot = await getDocs(queueCollection);

      let queueNumber;

      if (!queueSnapshot.empty) {
        const queueData = queueSnapshot.docs[0].data();
        console.log("Queue Data Retrieved:", queueData);

        const today = new Date().setHours(0, 0, 0, 0);
        const lastResetDate = queueData.lastResetDate?.toDate()?.setHours(0, 0, 0, 0) || 0;

        if (today !== lastResetDate) {
          // Reset queue number for a new day
          queueNumber = "001";
          await setDoc(queueSnapshot.docs[0].ref, {
            queueNumber,
            lastResetDate: Timestamp.fromDate(new Date()),
          });
        } else {
          // Increment queue number for the current day
          const lastQueueNumber = parseInt(queueData.queueNumber, 10) || 0;
          queueNumber = String(lastQueueNumber + 1).padStart(3, "0");
          await setDoc(queueSnapshot.docs[0].ref, {
            ...queueData,
            queueNumber,
          });
        }
      } else {
        // Initialize queue number if none exists
        queueNumber = "001";
        await setDoc(doc(queueCollection, "queueMeta"), {
          queueNumber,
          lastResetDate: Timestamp.fromDate(new Date()),
        });
      }

      console.log("Assigned Queue Number:", queueNumber);

      // Add to the queue collection
      const userRef = doc(collection(db, "queue"), id);
      await setDoc(userRef, {
        employeeID: id,
        queueNumber,
        status: "Waiting",
        timestamp: Timestamp.now(),
      });

      // Store employeeID in localStorage
      localStorage.setItem("employeeID", id);

      alert(`Your queue number is ${queueNumber}`);
      setId("");
      navigate("/queue-status");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error: Unable to register. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="overall">
        <div className="logo-group">
          <header className="register-header">
            <img src="/images/SKP-logo.jpg" alt="SKP Logo" className="logo" />
          </header>
        </div>

        <div className="content">
          <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="id">Employee ID</label>
                <input
                  type="text"
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
              </div>

              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
