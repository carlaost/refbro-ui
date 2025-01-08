import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react" // For the remove X icon

export default function Search() {
    const [inputText, setInputText] = useState("")
    const [dois, setDois] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

    const handleSubmit = async () => {
        if (dois.length === 0) return
        
        setIsLoading(true)
        setError(null)
        console.log('Submitting DOIs:', dois)

        try {
            const response = await fetch('/api/openalex/fetchMetadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dois }),
            })

            console.log('Response status:', response.status)
            const data = await response.json()
            console.log('Response data:', data)

            if (!response.ok) {
                throw new Error(`Failed to fetch paper metadata: ${data.error || 'Unknown error'}`)
            }

            console.log('Successfully fetched papers:', data.papers)

        } catch (err) {
            console.error('Error details:', err)
            setError('Failed to fetch paper metadata')
        } finally {
            setIsLoading(false)
        }
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

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading || dois.length === 0}
                >
                    {isLoading ? 'Loading...' : 'Submit papers'}
                </Button>
            </div>
        </div>
    )
}