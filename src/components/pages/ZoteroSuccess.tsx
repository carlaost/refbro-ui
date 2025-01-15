import { useEffect } from 'react';
import { supabase } from "../../App";
import { useSearchParams } from "react-router-dom";

function ZoteroSuccess() {
    const [searchParams] = useSearchParams();

    const handleZoteroCallback = async () => {
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

            const response = await fetch("http://localhost:5001/zotero-success", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    oauthToken,
                    oauthVerifier,
                }),
            });

            if (response.ok) {
                console.log("Zotero connected successfully");
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
