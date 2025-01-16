import { Button } from '../ui/button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Zotero({ session }: { session: any }) {


    const fetchZoteroData = async () => {
        const response = await fetch(`${API_URL}/zotero-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: session.user.email,
            }),
        });
        const data = await response.json();
        console.log(data);
    }
    return (
        <div>
            <h1>Zotero</h1>
            <Button onClick={fetchZoteroData}>Read from Zotero</Button>
        </div>
    )
}