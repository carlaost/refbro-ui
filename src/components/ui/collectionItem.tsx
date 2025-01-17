import { ZoteroCollection } from "@/types/types";
import { Button } from "./button";
import { ExternalLink } from "lucide-react";

interface CollectionProps extends ZoteroCollection {
    onGetRecommendations: (key: string) => void;
}

export default function Collection(props: CollectionProps) {
    return(
        <div className="border-b py-2">
            <CollectionComponent collection={props}/>
        </div>
    )
}

function CollectionComponent({ collection }: { collection: CollectionProps }) {
    return (
        <div className="flex flex-col gap-1">
            <div key={collection.key} className="items-start text-left w-full my-1 px-0 flex flex-row gap-2 justify-between items-center hover:bg-secondary/60 rounded-md">
                <div className="flex flex-col gap-2">
                    <p className={`font-medium pl-1 ${collection.numItems === 0 ? 'opacity-60' : ''}`}>
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
                    disabled={collection.numItems === 0} 
                    variant="secondary" 
                    className="border border-black/10" 
                    size="sm"
                    onClick={() => collection.onGetRecommendations(collection.key)}
                >
                    Get Recommendations
                </Button>
            </div>
            
            {collection.children?.length > 0 && (
                <div className="ml-2 border-l pl-2">
                    {collection.children.map(childCollection => (
                        <CollectionComponent 
                            key={childCollection.key} 
                            collection={{
                                ...childCollection,
                                onGetRecommendations: collection.onGetRecommendations,
                            }} 
                        />
                    ))}
                </div>
            )}
        </div>
    )
}