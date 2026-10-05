import { useState } from "react";
import api from "../services/api";

function Login({ setLoggedIn, setShowLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            const formData = new URLSearchParams();

            formData.append("username", email);
            formData.append("password", password);

            const response = await api.post(
                "/auth/login",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },
                }
            );

            localStorage.setItem(
                "access_token",
                response.data.access_token
            );

            setLoggedIn(true);

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-logo">
                    TaskFlow
                </div>

                <h1>Welcome back</h1>

                <p className="auth-subtitle">
                    Login to manage your tasks.
                </p>

                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className="auth-switch">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        onClick={() => setShowLogin(false)}
                    >
                        Create account
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;