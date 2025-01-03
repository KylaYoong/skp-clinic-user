import React, { useState } from "react";
import { db } from "./firebase-config";
import { collection, doc, setDoc, Timestamp, query, getDocs, where } from "firebase/firestore"; // Ensure 'where' is imported
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
      // Validate Employee ID
      const employeesCollection = collection(db, "employees");
      const employeeSnapshot = await getDocs(query(employeesCollection, where("empID", "==", id)));

      console.log("Employee Snapshot: ", employeeSnapshot); // Debugging log

      if (employeeSnapshot.empty) {
        alert("Invalid Employee ID! Please enter a valid ID.");
        return;
      }

      // Retrieve employee data (if necessary)
      const employeeData = employeeSnapshot.docs[0].data();
      console.log("Employee Data Retrieved: ", employeeData);

      // Process registration if validation is successful
      const queueCollection = collection(db, "queueMeta");
      const queueSnapshot = await getDocs(queueCollection);

      let queueNumber;
      let lastResetDate;

      if (!queueSnapshot.empty) {
        const queueData = queueSnapshot.docs[0].data();

        lastResetDate =
          queueData.lastResetDate && typeof queueData.lastResetDate.toDate === "function"
            ? queueData.lastResetDate.toDate()
            : new Date(0);

        const today = new Date().setHours(0, 0, 0, 0);
        if (today !== lastResetDate.setHours(0, 0, 0, 0)) {
          // Reset queue number for a new day
          queueNumber = "S5-01";
          await setDoc(queueSnapshot.docs[0].ref, {
            queueNumber,
            lastResetDate: Timestamp.fromDate(new Date()),
          });
        } else {
          // Increment queue number for the current day
          const lastQueueNumber =
            queueData.queueNumber && queueData.queueNumber.startsWith("S5-")
              ? parseInt(queueData.queueNumber.slice(3), 10)
              : 0;

          queueNumber = `S5-${String(lastQueueNumber + 1).padStart(2, "0")}`;
          await setDoc(queueSnapshot.docs[0].ref, {
            ...queueData,
            queueNumber,
          });
        }
      } else {
        // Initialize queue number if none exists
        queueNumber = "S5-01";
        await setDoc(doc(queueCollection, "queueMeta"), {
          queueNumber,
          lastResetDate: Timestamp.fromDate(new Date()),
        });
      }

      const userRef = doc(collection(db, "queue"), id);
      await setDoc(userRef, {
        employeeID: id,
        queueNumber,
        status: "waiting",
        timestamp: Timestamp.now(),
      });

      localStorage.setItem("employeeID", id);
      console.log("Updated Firestore with:", { employeeID: id, queueNumber });

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
