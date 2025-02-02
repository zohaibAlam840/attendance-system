// import AttendanceDisplay from "@/Components/AttendanceDisplay";
// import DailyReports from "@/Components/DailyReports";
// import StaffDisplay from "@/Components/StaffDisplay";
// import Tasks from "@/Components/Tasks";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
// import UsersDisplay from "@/Components/UsersDisplay";
// import React from "react";

// export default function TabsComponent() {
//   return (
//     <Tabs defaultValue="dailyReports" className="w-[100%]">
//       <TabsList>
//         <TabsTrigger value="dailyReports">Daily Reports</TabsTrigger>
//         <TabsTrigger value="Attendance">Attendance</TabsTrigger>
//         <TabsTrigger value="Staff">Staff</TabsTrigger>
//         <TabsTrigger value="Users">Users</TabsTrigger>
//         <TabsTrigger value="Tasks">Tasks</TabsTrigger>
//       </TabsList>
//       <div className="border-solid border-[1px] rounded-md border-slate-200 px-5 mt-2 h-[85vh] overflow-y-auto">
//         <TabsContent value="dailyReports">
//           <DailyReports />
//         </TabsContent>
//         <TabsContent value="Attendance">
//           <AttendanceDisplay />
//         </TabsContent>
//         <TabsContent value="Staff">
//           <StaffDisplay />
//         </TabsContent>
//         <TabsContent value="Users">
//           <UsersDisplay />
//         </TabsContent>
//         <TabsContent value="Tasks">
//           <Tasks />
//         </TabsContent>
//       </div>
//     </Tabs>
//   );

// }


import React, { useEffect, useState } from "react";
import { db } from "../../config/Firebase"; // Assuming Firebase is configured here
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import AttendanceDisplay from "@/Components/AttendanceDisplay";
import DailyReports from "@/Components/DailyReports";
import StaffDisplay from "@/Components/StaffDisplay";
import Tasks from "@/Components/Tasks";
import UsersDisplay from "@/Components/UsersDisplay";

export default function TabsComponent() {
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);  // Modal visibility state
  const [modalMessage, setModalMessage] = useState("");  // Message to display in the modal
  const [modalColor, setModalColor] = useState("");  // Modal background color based on action result

  // Fetch security threats from Firestore
  useEffect(() => {
    const fetchSecurityThreats = async () => {
      setLoading(true);
      setError(null);
  
      try {
        console.log("Fetching security threats...");
        
        // Fetch all documents from "securityThreats"
        const querySnapshot = await getDocs(collection(db, "securityThreats"));
        if (!querySnapshot.empty) {
          const threats = querySnapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data()
          }));
          console.log("Fetched security threats:", threats);
          setSecurityAlerts(threats);
        } else {
          console.warn("No security threats found.");
        }
      } catch (error) {
        console.error("Error fetching security threats:", error);
        setError("Failed to fetch security threats. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchSecurityThreats();
  }, []);

  // Function to update admin action/status
  const updateAlertStatus = async (alertId, field, value) => {
    try {
      const alertRef = doc(db, "securityThreats", alertId);
      await updateDoc(alertRef, {
        [field]: value
      });

      // Update alert in local state
      setSecurityAlerts(prevState => 
        prevState.map(alert => 
          alert.id === alertId ? { ...alert, [field]: value } : alert
        )
      );

      // Show modal with success message
      setModalMessage(`Alert status has been updated to ${value}.`);
      setModalColor("bg-green-100");  // Set modal color to green (success)
      setModalVisible(true);

      console.log(`Updated ${field} for alert ${alertId}`);
    } catch (error) {
      console.error("Error updating alert:", error);

      // Show modal with error message
      setModalMessage("Failed to update alert. Please try again.");
      setModalColor("bg-red-100");  // Set modal color to red (error)
      setModalVisible(true);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setModalMessage("");  // Reset modal message
    setModalColor("");    // Reset modal color
  };

  return (
    <Tabs defaultValue="dailyReports" className="w-[100%]">
      <TabsList>
        <TabsTrigger value="dailyReports">Daily Reports</TabsTrigger>
        <TabsTrigger value="Attendance">Attendance</TabsTrigger>
        <TabsTrigger value="Staff">Staff</TabsTrigger>
        <TabsTrigger value="Users">Users</TabsTrigger>
        <TabsTrigger value="Tasks">Tasks</TabsTrigger>
        <TabsTrigger value="SecurityAlerts">Security Alerts</TabsTrigger>
      </TabsList>
      <div className="border-solid border-[1px] rounded-md border-slate-200 px-5 mt-2 h-[85vh] overflow-y-auto">
        <TabsContent value="dailyReports">
          <DailyReports />
        </TabsContent>
        <TabsContent value="Attendance">
          <AttendanceDisplay />
        </TabsContent>
        <TabsContent value="Staff">
          <StaffDisplay />
        </TabsContent>
        <TabsContent value="Users">
          <UsersDisplay />
        </TabsContent>
        <TabsContent value="Tasks">
          <Tasks />
        </TabsContent>
        <TabsContent value="SecurityAlerts">
          <h2 className="text-xl font-semibold mb-4">Security Alerts</h2>
          {loading ? (
            <p>Loading security alerts...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : securityAlerts.length > 0 ? (
            <ul className="space-y-4">
              {securityAlerts.map(alert => (
                <li 
                  key={alert.id} 
                  className={`p-4 border rounded-md shadow-md transition-all duration-300
                    ${alert.alert_status === "Critical" ? "bg-red-500 text-white" : 
                      alert.alert_status === "High" ? "bg-yellow-500 text-black" : 
                      alert.alert_status === "Medium" ? "bg-orange-400 text-black" : 
                      alert.alert_status === "Low" ? "bg-blue-400 text-white" : 
                      alert.alert_status === "Resolved" ? "bg-green-500 text-white" : 
                      "bg-gray-200 text-black"}`}
                >
                  <p><strong>User:</strong> {alert.user_name} ({alert.user_id})</p>
                  <p><strong>Location Fence:</strong> {alert.location_fence}</p>
                  <p><strong>Breach Time:</strong> {alert.breach_time}</p>
                  <p><strong>Exit Coordinates:</strong> {alert.exit_coordinates}</p>
                  <p><strong>Admin Action:</strong> {alert.admin_action}</p>
                  <p><strong>Alert Status:</strong> {alert.alert_status}</p>

                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => updateAlertStatus(alert.id, 'alert_status', 'Resolved')} 
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                      Mark Resolved
                    </button>
                    <button 
                      onClick={() => updateAlertStatus(alert.id, 'alert_status', 'Escalated')} 
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                      Escalate
                    </button>
                    <button 
                      onClick={() => updateAlertStatus(alert.id, 'alert_status', 'High')} 
                      className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600">
                      Set High
                    </button>
                    <button 
                      onClick={() => updateAlertStatus(alert.id, 'alert_status', 'Medium')} 
                      className="bg-orange-400 text-black px-4 py-2 rounded hover:bg-orange-500">
                      Set Medium
                    </button>
                    <button 
                      onClick={() => updateAlertStatus(alert.id, 'alert_status', 'Low')} 
                      className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500">
                      Set Low
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No security alerts available.</p>
          )}
        </TabsContent>
      </div>

      {/* Modal for feedback */}
      {modalVisible && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className={`bg-white p-6 rounded-md shadow-md ${modalColor}`}>
            <h2 className="text-xl font-semibold">{modalMessage}</h2>
            <button 
              onClick={closeModal} 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Close
            </button>
          </div>
        </div>
      )}
    </Tabs>
  );
}
