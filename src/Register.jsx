import React, { useState } from "react";
import { db } from "./firebase-config";
import { collection, doc, setDoc, Timestamp, query, getDocs, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [id, setId] = useState(""); // State variable to store employee ID
  const navigate = useNavigate(); // Hook to enable navigation within the app

  // Function to check if an employee has already registered today
  const checkDuplicateRegistration = async (employeeID) => {
    try {
      const queueCollection = collection(db, "queue");  // Reference to the "queue" collection in Firestore
  
      // Get today's date at 00:00:00 (midnight)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
  
      // Convert to Firestore Timestamp
      const todayTimestamp = Timestamp.fromDate(todayStart);
  
      // Query Firestore for today's registrations for this employee
      const queueQuery = query(
        queueCollection,
        where("employeeID", "==", employeeID),
        where("timestamp", ">=", todayTimestamp) // Only today's registrations
      );
  
      const queueSnapshot = await getDocs(queueQuery);  // Execute query
  
      // If snapshot is not empty, user has already registered today
      return !queueSnapshot.empty;
    } catch (error) {
      console.error("Error checking duplicate registration:", error);
      return false; // Assume not registered in case of an error
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the current time in Asia/Kuala_Lumpur timezone
    const currentTime = new Date();

    // Create separate Date objects for time comparison
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0); // 8:00 AM

    const endTime = new Date();
    endTime.setHours(12, 0, 0, 0); // 12:00 PM


    // Check if current time is within allowed range
    if (currentTime < startTime || currentTime > endTime) {
      alert(
        "Registration is available only from 8:00 AM to 12:00 PM.\n" +
        "Pendaftaran hanya dibuka dari 8:00 AM hingga 12:00 PM.\n" +
        "दर्ता केवल बिहान ८:०० देखि दिउँसो १२:०० बजेसम्म खुला हुन्छ।\n" +
        "မှတ်ပုံတင်မှုသည် မနက် ၈:၀၀ မှ နေ့လည် ၁၂:၀၀ အထိသာ ရနိုင်ပါသည်။"
      );
      return;
    }

    // Check if the employee has already registered today
    const hasRegistered = await checkDuplicateRegistration(id);

    if (hasRegistered) {
      alert("You have already registered today!");
      return;
    }

    try {
      // Query the queue collection to check if the employee has already registered today
      const queueCollection = collection(db, "queue");
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Start of the day

      const queueQuery = query(
        queueCollection,
        where("employeeID", "==", id),
        where("timestamp", ">=", Timestamp.fromDate(todayStart)) // Only today's registrations
      );

      const queueSnapshot = await getDocs(queueQuery);

      if (!queueSnapshot.empty) {
        alert("You have already registered today!");
        return;
      }

      // Query the employees collection
      const employeesCollection = collection(db, "employees");
      const employeeQuery = query(employeesCollection, where("employeeID", "==", id));
      const employeeSnapshot = await getDocs(employeeQuery);

      console.log("Employee Query Results:", employeeSnapshot.docs.map((doc) => doc.data()));

      // Check if the Employee ID exists
      if (employeeSnapshot.empty) {
        alert(
          "Please register, you are not in the system. \n" +
          "Sila daftar, anda tidak berada dalam sistem. \n" +
          "कृपया दर्ता गर्नुहोस्, तपाईं प्रणालीमा हुनुहुन्न। \n" +
          "ကျေးဇူးပြု၍ မှတ်ပုံတင်ပါ၊ သင်စနစ်တွင်မရှိပါ။"
        );
        return;
      }

      // Retrieve employee data (optional)
      const employeeData = employeeSnapshot.docs[0].data();
      console.log("Employee Data Retrieved:", employeeData);

      // Queue management
      const queueMetaCollection = collection(db, "queueMeta");
      const queueSnapshotMeta = await getDocs(queueMetaCollection);

      let queueNumber;

      if (!queueSnapshotMeta.empty) {
        const queueData = queueSnapshotMeta.docs[0].data();
        console.log("Queue Data Retrieved:", queueData);

        const today = new Date().setHours(0, 0, 0, 0);
        const lastResetDate = queueData.lastResetDate?.toDate()?.setHours(0, 0, 0, 0) || 0;

        if (today !== lastResetDate) {
          // Reset queue number for a new day
          queueNumber = "001";
          await setDoc(queueSnapshotMeta.docs[0].ref, {
            queueNumber,
            lastResetDate: Timestamp.fromDate(new Date()),
          });
        } else {
          // Increment queue number for the current day
          const lastQueueNumber = parseInt(queueData.queueNumber, 10) || 0;
          queueNumber = String(lastQueueNumber + 1).padStart(3, "0");
          await setDoc(queueSnapshotMeta.docs[0].ref, {
            ...queueData,
            queueNumber,
          });
        }
      } else {
        // Initialize queue number if none exists
        queueNumber = "001";
        await setDoc(doc(queueMetaCollection, "queueMeta"), {
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
