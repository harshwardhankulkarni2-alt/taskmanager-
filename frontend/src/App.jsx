import { useState } from "react";
import "./App.css";

import Login from "./pages/temp";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
    const [loggedIn, setLoggedIn] = useState(
        Boolean(localStorage.getItem("access_token"))
    );

    const [showLogin, setShowLogin] = useState(true);

    if (!loggedIn) {
        if (showLogin) {
            return (
                <Login
                    setLoggedIn={setLoggedIn}
                    setShowLogin={setShowLogin}
                />
            );
        }

        return (
            <Register
                setShowLogin={setShowLogin}
            />
        );
    }

    return (
        <Dashboard
            setLoggedIn={setLoggedIn}
        />
    );
}

export default App;