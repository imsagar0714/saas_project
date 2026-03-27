import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await login(email, password);
            alert("Login successful");
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err);
            alert("Login failed");
        }
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>Login</h2>

            <div style={{ marginBottom: "10px" }}>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: "8px", width: "250px" }}
                />
            </div>

            <div style={{ marginBottom: "10px" }}>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: "8px", width: "250px" }}
                />
            </div>

            <button
                onClick={handleLogin}
                style={{ padding: "8px 16px", cursor: "pointer" }}
            >
                Login
            </button>
        </div>
    );
}

export default Login;