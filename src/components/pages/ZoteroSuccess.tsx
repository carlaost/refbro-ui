import { useEffect } from 'react';
import { supabase } from "../../App";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

async function fetchSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Error fetching session:", error.message);
    }

    if (!session) {
        console.error("User session not found");
    }

    return session;
}

function ZoteroSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const handleZoteroCallback = async () => {
        const session = await fetchSession();
        if (!session) return;

        try {
            const oauthToken = searchParams.get("oauth_token");
            const oauthVerifier = searchParams.get("oauth_verifier");

            if (!oauthToken || !oauthVerifier) {
                console.error("Missing OAuth parameters in URL");
                return;
            }

            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error.message);
                return;
            }

            if (!user) {
                console.error("User not logged in");
                return;
            }

            const response = await fetch(`${API_URL}/zotero-success`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    // userId: user.id,
                    email: session.user.email,
                    oauthToken,
                    oauthVerifier,
                }),
            });

            if (response.ok) {
                console.log("Zotero connected successfully");
                navigate('/zotero');
            } else {
                const errorData = await response.json();
                console.error("Failed to connect Zotero:", errorData);
            }
        } catch (error) {
            console.error("Error during Zotero callback:", error);
        }
    };

    useEffect(() => {
        handleZoteroCallback();
    }, []); // Run only once when the component mounts

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Logging you into Zotero...</h1>
        </div>
    );
}

export default ZoteroSuccess;
