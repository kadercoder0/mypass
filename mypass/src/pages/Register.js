import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PasswordBuilder from '../patterns/PasswordBuilder'; // Import the PasswordBuilder to generate passwords
import uiController from "../patterns/UIController";
import './styles.css';

const Register = () => {
    // Manage form data including email, password, security questions, and answers
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        securityQuestions: ["", "", ""],
        securityAnswers: ["", "", ""],
    });

    // Manage password strength validation message
    const [passwordStrength, setPasswordStrength] = useState("");
    // Control visibility of password fields
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Generate a strong password with specific requirements
    const generatePassword = () => {
        const passwordBuilder = new PasswordBuilder()
            .setLength(12) // Set length of password
            .setUppercase(true) // Include uppercase letters
            .setNumbers(true) // Include numbers
            .setSpecialChars(true); // Include special characters

        // Generate password and update form
        const newPassword = passwordBuilder.generate();
        setFormData({ ...formData, password: newPassword, confirmPassword: newPassword });
        checkPasswordStrength(newPassword);
    };

    // Check the password strength based on certain criteria
    const checkPasswordStrength = (password) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()]/.test(password);
        const isLongEnough = password.length >= 8;

        // Provide feedback based on password strength
        if (!isLongEnough) {
            setPasswordStrength("Password must be at least 8 characters long.");
        } else if (!hasUppercase) {
            setPasswordStrength("Password must contain at least one uppercase letter.");
        } else if (!hasNumber) {
            setPasswordStrength("Password must contain at least one number.");
        } else if (!hasSpecialChar) {
            setPasswordStrength("Password must contain at least one special character.");
        } else {
            setPasswordStrength("Strong password!");
        }
    };

    // Update form data on input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            checkPasswordStrength(value); // Check password strength on change
        }
    };

    // Handle form submission and registration process
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Check if password is strong enough
        if (passwordStrength !== "Strong password!") {
            alert("Please use a strong password before registering.");
            return;
        }

        // Submit registration request
        try {
            const response = await axios.post("http://localhost/mypass/register.php", formData);
            if (response.data.success) {
                uiController.notify("Register", "REGISTER_SUCCESS");
            }

            alert(response.data.message);

            // Reset form and navigate to login page
            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                securityQuestions: ["", "", ""],
                securityAnswers: ["", "", ""],
            });
            navigate("/login");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Registration failed: " + (error.response?.data?.error || error.message));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />

            {/* Password Field */}
            <div style={{ position: "relative" }}>
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button
                    type="button"
                    style={{ position: "absolute", right: "10px", top: "5px" }}
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>

            {/* Confirm Password Field */}
            <div style={{ position: "relative" }}>
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button
                    type="button"
                    style={{ position: "absolute", right: "10px", top: "5px" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? "Hide" : "Show"}
                </button>
            </div>

            {/* Display Password Strength */}
            <p>{passwordStrength}</p>

            {/* Button to generate a strong password */}
            <button type="button" onClick={generatePassword}>
                Generate Strong Password
            </button>

            <h3>Security Questions</h3>
            {/* Input fields for security questions and answers */}
            {formData.securityQuestions.map((question, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder={`Security Question ${index + 1}`}
                        value={question}
                        onChange={(e) => {
                            const updatedQuestions = [...formData.securityQuestions];
                            updatedQuestions[index] = e.target.value;
                            setFormData({ ...formData, securityQuestions: updatedQuestions });
                        }}
                        required
                    />
                    <input
                        type="text"
                        placeholder={`Answer ${index + 1}`}
                        value={formData.securityAnswers[index]}
                        onChange={(e) => {
                            const updatedAnswers = [...formData.securityAnswers];
                            updatedAnswers[index] = e.target.value;
                            setFormData({ ...formData, securityAnswers: updatedAnswers });
                        }}
                        required
                    />
                </div>
            ))}

            <button type="submit">Register</button>

            {/* Button to navigate to the login page */}
            <button type="button" onClick={() => navigate("/login")}>
                Go to Login
            </button>
        </form>
    );
};

export default Register;
