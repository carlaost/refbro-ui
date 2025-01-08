import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react" // For the remove X icon

export default function Search() {
    const [inputText, setInputText] = useState("")
    const [dois, setDois] = useState<string[]>([])

    const extractDois = (text: string) => {
        // Regex to match both DOI formats, allowing dots in the suffix
        const doiRegex = /(?:https?:\/\/doi\.org\/|(?:doi:)?)?(10\.\d{4,}(?:\.\d+)*\/[a-zA-Z0-9.-]+?)(?:[^a-zA-Z0-9.]|$)/g
        
        // Extract unique DOIs
        const matches = [...new Set(
            Array.from(text.matchAll(doiRegex), match => match[1])
        )]
        
        setDois(matches)
    }

    const removeDoi = (doiToRemove: string) => {
        setDois(dois.filter(doi => doi !== doiToRemove))
    }

    return (
        <div className="flex flex-col items-start justify-center max-w-lg mx-auto pt-20 gap-4">
            <div className="flex flex-col items-start text-left">
                <h1 className="text-2xl font-semibold tracking-tight">Paste DOIs of interesting papers</h1>
                <p className="text-sm text-gray-500">Paste a list of DOIs of papers you've been reading to find more relevant publications for your research. Don't worry about formatting.</p>
            </div>

            <div className="grid w-full gap-2">
                <Textarea 
                    placeholder="Paste DOIs here." 
                    value={inputText}
                    onChange={(e) => {
                        setInputText(e.target.value)
                        extractDois(e.target.value)
                    }}
                />
                
                {/* DOI Pills */}
                <div className="flex flex-wrap gap-2">
                    {dois.slice(0, 6).map((doi) => (
                        <div 
                            key={doi}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                        >
                            <span>{doi}</span>
                            <button 
                                onClick={() => removeDoi(doi)}
                                className="hover:text-red-500"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {dois.length > 6 && (
                        <div className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-sm">
                            <span>+{dois.length - 6} more DOIs</span>
                        </div>
                    )}
                </div>

                <Button>Submit papers</Button>
            </div>
        </div>
    )
}