import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Data({ session }: { session: any }) {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevents the default form submission behavior
        console.log(inputValue); // Logs the input value to the console
        try {
            const response = await fetch(`${API_URL}/supabase-test`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 'Authorization': `Bearer ${session.access_token}`,
                    // 'Refresh-Token': session.refresh_token,
                },
                body: JSON.stringify({ 
                    zotero_access_token: 'access token', 
                    zotero_access_secret: 'access secret',
                    zotero_user_id: 'user id',
                    email: session.user.email,
                }),

            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Assuming you want to log the response data
        } catch (error) {
            console.error('Error posting data:', error);
        }
        setInputValue("");
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md mx-auto">
                <Input value={inputValue} onChange={handleInputChange} />
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
}