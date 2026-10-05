import { useState } from "react";
import api from "../services/api";

function Register({ setShowLogin }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            await api.post("/auth/register", {
                username: username,
                email: email,
                password: password,
            });

            alert("Registration successful! Please login.");
            setShowLogin(true);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">Task Manager</div>

                <h1>Create Account</h1>
                <p className="auth-subtitle">Sign up to get started</p>

                <form className="auth-form" onSubmit={handleRegister}>
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <div className="auth-switch">
                    Already have an account?
                    <button type="button" onClick={() => setShowLogin(true)}>
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;