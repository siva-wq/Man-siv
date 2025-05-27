import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API } from "./config";

const Updatename = () => {
  const userId = localStorage.getItem("userId");
  const [uname, setUname] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const navigate = useNavigate();

  const updateName = async () => {
    if (!uname.trim()) {
      alert("Please enter a valid username.");
      return;
    }

    setUpdatingName(true); // Set loading state
    const data = new URLSearchParams(); // Format data as x-www-form-urlencoded
    data.append("userId", userId);
    data.append("uname", uname);

    try {
      const response = await axios.post(
        `${API}updatename.php`,
        data,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      console.log(response)
      // Check API response
      if (response.data.status) {
        alert("Username updated successfully!");
        setUname(""); // Clear the input field
        navigate("/profile"); // Navigate to profile page
      } else {
        alert("Failed to update username. Please try again.");
      }
    } catch (error) {
      console.error("Error updating name:", error.response?.data || error.message);
      alert("Failed to update username. Please check your internet connection.");
    } finally {
      setUpdatingName(false); // Reset loading state
    }
  };

  return (
    <div className="form-field">
      <label className="shad-form_label">Enter New Updated Name</label>
      <input
        className="shad"
        type="text"
        placeholder="New username"
        value={uname}
        onChange={(e) => setUname(e.target.value)}
      />
      <button onClick={updateName} disabled={updatingName}>
        {updatingName ? "Updating..." : "Update Name"}
      </button>
    </div>
  );
};

export default Updatename;
