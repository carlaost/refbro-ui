import { ZoteroCollection } from "@/types/types";
import { Button } from "./button";
import { useMemo } from 'react';
import { ExternalLink } from "lucide-react";

interface CollectionProps {
    collection: ZoteroCollection;
    handleGetRecommendations: (keys: string[]) => void;
}

export default function Collection({ collection, handleGetRecommendations }: CollectionProps) {
    const collectionKeys = useMemo(() => {
        const getAllCollectionKeys = (collection: ZoteroCollection): string[] => {
            let keys = [collection.key];
            if (collection.children?.length > 0) {
                collection.children.forEach(child => {
                    keys = [...keys, ...getAllCollectionKeys(child)];
                });
            }
            return keys;
        };
        
        return getAllCollectionKeys(collection);
    }, [collection]);

    return (
        <div className="flex flex-col gap-1">
            <div className={`flex flex-row justify-between items-center hover:bg-secondary/70 hover:text-black text-black/80 rounded-md py-1 px-2`}>
                <div className="flex flex-col gap-2">
                    <p className={`font-medium text-left pl-1 ${collection.numItems === 0 ? 'opacity-60' : ''}`}>
                        {collection.name.length > 60 ? `${collection.name.substring(0, 60)}...` : collection.name}
                    </p>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="text-xs uppercase tracking-wide bg-secondary px-2 py-1 rounded-full whitespace-nowrap h-6 items-center">
                            {collection.numItems} Items
                        </div>
                        <a 
                            href={collection.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs uppercase tracking-wide bg-secondary px-2 py-1 rounded-full whitespace-nowrap flex flex-row gap-1 h-6 items-center text-primary font-normal hover:text-black hover:bg-primary/10"
                        >
                            <ExternalLink size={14} strokeWidth={1.5}/>
                            Link
                        </a>
                    </div>
                </div>
                <Button
                    onClick={() => handleGetRecommendations(collectionKeys)}
                    disabled={collection.numItems === 0}
                    variant="secondary"
                    className="border border-black/5"
                    size="sm"
                >
                    Get Recommendations
                </Button>
            </div>
            {collection.children?.length > 0 && (
                <div className="ml-4 border-l pl-2">
                    {collection.children.map(childCollection => (
                        <div key={childCollection.key}>
                            <Collection
                            collection={childCollection}
                            handleGetRecommendations={handleGetRecommendations}
                            key={childCollection.key}
                        />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}