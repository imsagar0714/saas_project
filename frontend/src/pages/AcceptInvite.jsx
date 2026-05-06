import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function AcceptInvite() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("Processing invitation...");

    useEffect(() => {
        const acceptInvite = async () => {
            try {
                await API.post(`/accept-invite/${token}/`);

                setMessage("Successfully joined workspace!");

                // redirect after 2 sec
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);

            } catch (err) {
                console.error(err);

                const errorMsg =
                    err.response?.data?.detail ||
                    "Invalid or expired invitation";

                setMessage(` ${errorMsg}`);
            } finally {
                setLoading(false);
            }
        };

        acceptInvite();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="p-8 bg-gray-900 rounded-xl border border-gray-700 text-center">
                <h1 className="text-2xl font-bold mb-4">
                    Invitation Status
                </h1>

                <p className="text-lg">{message}</p>

                {loading && (
                    <p className="mt-4 text-gray-400">Please wait...</p>
                )}
            </div>
        </div>
    );
}

export default AcceptInvite;