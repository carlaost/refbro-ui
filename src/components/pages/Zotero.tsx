import { useState, useEffect } from 'react';
import { Button } from '../ui/button'
import Collection from '../ui/collection';
import { useNavigate } from 'react-router-dom';
import { InfoIcon, RefreshCcw } from 'lucide-react';
import { ZoteroCollection } from '@/types/types';
import LoadingToast from '../ui/loadingToast';
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Zotero({ session }: { session: any }) {

    const navigate = useNavigate();
    const [collections, setCollections] = useState<ZoteroCollection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [useHybrid, setUseHybrid] = useState(false);

    useEffect(() => {
        if (session) {
            console.log('fetching collections')
            fetchZoteroCollections();
        }
    }, []);

    const handleGetRecommendations = async (collectionKeys: string[], names: string[]) => {
        if (!collectionKeys) {
            console.error('Collection key is missing');
            return;
        }
        setIsLoading(true)
        console.log('fetching for key', collectionKeys)
        try {
            const response = await fetch(`${API_URL}/zotero/collections/recommendations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    collection_keys: collectionKeys, 
                    email: session.user.email,
                    endpoint: useHybrid ? 'mixed' : 'colab'
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
            }
            const data = await response.json();
            
            if (useHybrid) {
                const papers1 = data.colab_response.recommendations.map((rec: any) => ({
                    title: rec.title || 'No title available',
                    authors: rec.authors || '',
                    year: rec.year || '',
                    journal: rec.journal || '',
                    doi: rec.doi || '',
                    abstract: rec.abstract || '',
                    score: rec.score
                }));
                
                const papers2 = data.queries_response.recommendations.map((rec: any) => ({
                    title: rec.title || 'No title available',
                    authors: rec.authors || '',
                    year: rec.year || '',
                    journal: rec.journal || '',
                    doi: rec.doi || '',
                    abstract: rec.abstract || '',
                    score: rec.score
                }));
                
                navigate('/results', { state: { papers1, papers2, names: ['Collaborative', 'Query-based'], isHybrid: true } });
            } else {
                const papers = data.recommendations.map((rec: any) => ({
                    title: rec.title || 'No title available',
                    authors: rec.authors || '',
                    year: rec.year || '',
                    journal: rec.journal || '',
                    doi: rec.doi || '',
                    abstract: rec.abstract || '',
                    score: rec.score
                }));
                
                navigate('/results', { state: { papers, names } });
            }
        } catch (error) {
            console.error('Error fetching Zotero recommendations:', error);
        } finally {
            setIsLoading(false);
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
        <div className="flex flex-col items-start justify-center w-full max-w-lg mx-auto pt-12 gap-4">
            <div className="flex flex-col gap-2 items-start text-left">
                    <h1 className="text-2xl font-black tracking-tight">Your Zotero Collections</h1>
                    <p className="text-gray-500">You can get recommendations based on your Zotero collections. Just select a collection and see what you might have missed.</p>
                    <div className="text-sm font-medium p-4 bg-yellow-50 border border-yellow-300 rounded-md flex flex-row items-center gap-4">
                        <InfoIcon className="text-yellow-500 w-8 h-8"/>
                        <p>Right now, we only support integration with <a href="https://www.zotero.org/">Zotero Web Libraries</a>. If your Zotero data is not synced we may not be able to access it.</p>
                    </div>
                </div>
            <div className="flex items-center space-x-2 mb-4">
                <Switch
                    id="hybrid-mode"
                    checked={useHybrid}
                    onCheckedChange={setUseHybrid}
                />
                <Label htmlFor="hybrid-mode">
                    Use hybrid recommendations
                </Label>
            </div>
            <div className="w-full flex flex-col gap-0 mb-20">
                {collections.length === 0 ? (
                    <Button className="text-sm" variant="outline" onClick={fetchZoteroCollections}>
                        <RefreshCcw className="w-4 h-4 mr-2"/>
                        Fetch Zotero Collections
                    </Button>
                ) : (
                    collections.map((collection: ZoteroCollection) => (
                        <Collection 
                            key={collection.key}
                            collection={collection}
                            handleGetRecommendations={handleGetRecommendations}
                        />
                    ))
                )}
            </div>
            {isLoading ? <LoadingToast/> : null }
        </div>
    )
}