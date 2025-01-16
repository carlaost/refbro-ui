import { useState, useEffect } from 'react';
import { Button } from '../ui/button'
import { Card } from '../ui/card';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Zotero({ session }: { session: any }) {

    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        if (session) {
            console.log('fetching collections')
            fetchZoteroCollections();
        }
    }, []);

    const handleGetRecommendations = async (collectionKey: string) => {
        console.log('Getting recommendations for collection:', collectionKey);
        try {
            const response = await fetch(`${API_URL}/zotero/collections/recommendations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    collection_key: collectionKey, 
                    email: session.user.email,
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
            }
            const data = await response.json();
            const papers = data.recommendations.map((rec: any) => ({
                title: rec.title || 'No title available',
                authors: rec.authors || '',
                year: rec.year || '',
                journal: rec.journal || '',
                doi: rec.doi || '',
                abstract: rec.abstract || '',
                score: rec.score
            }))

            navigate('/results', { state: { papers } }) 

        } catch (error) {
            console.error('Error fetching Zotero recommendations:', error);
        }
    };

    const fetchZoteroCollections = async () => {
        if (!session) {
            console.error('No session available');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/zotero/collections`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: session.user.email,
                }),
            });
            const data = await response.json();
            setCollections(data.zotero_collections);
            console.log(data)
        } catch (error) {
            console.error('Error fetching Zotero collections:', error);
        }
    }
    return (
        <div className="flex flex-col items-start justify-center w-full max-w-md mx-auto pt-12 gap-4">
            <div className="flex flex-col gap-2 items-start text-left">
                    <h1 className="text-2xl font-black tracking-tight">Your Zotero Collections</h1>
                    <p className="text-gray-500">You can get recommendations based on your Zotero collections. Just select a collection and see what you might have missed.</p>
                </div>
            <div className="w-full flex flex-col gap-2">
                {collections.map((collection: any) => (
                    <Card key={collection.data.key} className="w-full p-2 pl-4 items-start flex flex-row justify-between items-center">
                        <p className="font-semibold">{collection.data.name} <span className="text-gray-500 font-normal text-sm">{collection.meta.numItems} items</span></p>
                        <Button className="text-sm" onClick={() => handleGetRecommendations(collection.data.key)}>Get Recommendations</Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}