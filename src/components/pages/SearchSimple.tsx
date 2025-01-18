import { useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import { DropArea } from "@/components/ui/drop-area"
import { Separator } from "@/components/ui/separator"
import { InfoIcon } from "lucide-react"

// Update DOI_REGEX to properly capture complete DOIs including the "10." prefix
const DOI_REGEX = /(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)?(10\.\d{4,9}\/[-_.;()\/:a-zA-Z0-9]+)/g

interface Recommendation {
    title?: string;
    doi: string | null;
    year: number;
    score: number;
    authors?: string;
    journal?: string;
    abstract?: string;
}

interface SearchProps {
    apiEndpoint: string;
    session?: any;
    zoteroConnected?: boolean;
    handleConnectZoteroClick?: () => void;
}

// Add new type definitions
type DoiSource = {
    type: 'file';
    fileName: string;
    dois: string[];
} | {
    type: 'pasted';
    dois: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Search({ apiEndpoint, session, zoteroConnected, handleConnectZoteroClick }: SearchProps) {
    const navigate = useNavigate()
    const [inputText, setInputText] = useState("")
    const [doiSources, setDoiSources] = useState<DoiSource[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    // Helper function to get all unique DOIs
    const getAllDois = useCallback(() => {
        return [...new Set(doiSources.flatMap(source => source.dois))]
    }, [doiSources])

    // Update handlePastedDois to decode URL-encoded characters
    const handlePastedDois = (text: string) => {
        console.log("Input text:", text); // Debug input
        
        const potentialDois = text
            .split(/[,;\s]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0);
        
        console.log("After split:", potentialDois); // Debug splits
        
        const matches = potentialDois.flatMap(doi => {
            console.log("Testing DOI:", doi); // Debug each potential DOI
            const match = doi.match(DOI_REGEX);
            console.log("Match result:", match); // Debug regex match
            
            if (!match) return [];
            
            const cleaned = decodeURIComponent(match[1] || match[0])
                .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
                .replace(/^doi:/, '');
            console.log("Cleaned DOI:", cleaned); // Debug cleaned result
            return cleaned;
        });
        
        const uniqueMatches = [...new Set(matches)];
        console.log("Final matches:", uniqueMatches); // Debug final result
        
        setDoiSources(prev => {
            const newSources = prev.filter(source => source.type !== 'pasted')
            return [...newSources, { type: 'pasted', dois: uniqueMatches }]
        })
    }

    const handleSubmit = async () => {
        const allDois = getAllDois().slice(0, 50) // Limit to first 50 DOIs
        if (allDois.length === 0) return
        
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/${apiEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ queries: allDois }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
            }

            const data = await response.json()
            const papers = data.recommendations.map((rec: Recommendation) => ({
                title: rec.title || 'No title available',
                authors: rec.authors || '',
                year: rec.year || '',
                journal: rec.journal || '',
                doi: rec.doi || '',
                abstract: rec.abstract || '',
                score: rec.score
            }))
            
            navigate('/results', { state: { papers } })

        } catch (err) {
            console.error('Error details:', err)
            setError('Failed to fetch recommendations')
        } finally {
            setIsLoading(false)
        }
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsLoading(true)
        setError(null)
        setUploadedFiles(acceptedFiles)

        try {
            for (const file of acceptedFiles) {
                const text = await file.text()
                const extension = file.name.split('.').pop()?.toLowerCase()

                if (extension === 'bib' || extension === 'bibtex' || extension === 'ris') {
                    const matches = [...new Set(
                        Array.from(text.matchAll(DOI_REGEX), match => match[1])
                    )]
                    
                    setDoiSources(prev => {
                        const newSources = prev.filter(source => 
                            !(source.type === 'file' && source.fileName === file.name)
                        )
                        return [...newSources, { type: 'file', fileName: file.name, dois: matches }]
                    })
                }
            }
        } catch (err) {
            console.error('Error processing file:', err)
            setError('Failed to process file. Please make sure it\'s a valid BibTeX or RIS file.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const removeFile = (fileName: string) => {
        setUploadedFiles(files => files.filter(file => file.name !== fileName))
        setDoiSources(prev => prev.filter(source => 
            !(source.type === 'file' && source.fileName === fileName)
        ))
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value)
        handlePastedDois(e.target.value)
    }

    return (
        <div className="flex flex-col items-start justify-center w-full mx-auto pt-12 gap-4 max-w-lg px-8">

            <div className="w-full flex flex-col gap-2 text-left">
                <h1 className="text-2xl font-black tracking-tight">Better paper recommendations based on your current reading list</h1>
                <p className="text-gray-500">Oshima is a research paper recommender that keeps you updated with the latest research in your field. Provide some example papers you've been reading or saving. Oshima will find other papers that might interest you.</p>
                <p className="text-gray-500 font-bold"></p>
                <div className={`text-sm font-medium p-4 bg-blue-100 border border-blue-300 rounded-md flex flex-row items-start gap-4 ${zoteroConnected ? 'mb-16' : ''}`}>
                    <InfoIcon className="text-blue-500 w-8 h-8 mt-2"/>
                    <div className="flex flex-col gap-2">
                        <p>
                            You can now get recommendations based on your Zotero collections!
                            {!zoteroConnected && session === null && " Create an account to get started."}
                        </p>
                        {session && (zoteroConnected ? 
                            <Button className="mr-8" onClick={() => navigate('/zotero')}>Try Recommendations based on Zotero</Button> 
                            :
                            <Button className="mr-8" onClick={handleConnectZoteroClick}>Connect Zotero</Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col gap-4 px-2">
                <div className="w-full flex flex-col gap-1 items-start">
                    <div className="flex flex-row items-center gap-1 text-gray-500">
                        <p className="text-sm">Paste a list of DOIs or an entire .bib or .ris file. <a 
                            href="/faq?section=item-1" 
                            target="_blank"
                            className="text-gray-500 hover:text-gray-700"
                        >How?</a></p>
                    </div>
                    <Textarea
                        placeholder="doi.org/10.1000/182, 10.1025/23456654"
                        value={inputText}
                        onChange={handleTextareaChange}
                        className="h-24"
                    />
                </div>
                <div className="w-full flex flex-row items-center justify-center gap-2">
                    <Separator className="w-52" />
                    <p className="flex-shrink-0 text-xs text-gray-500">OR</p>
                    <Separator className="w-52" />
                </div>
                <div className="w-full flex flex-col gap-1 items-start">
                    <div className="flex flex-row items-center gap-1 text-gray-500">
                        <p className="text-sm">Upload a BibTeX or RIS file from your reference manager. <a 
                            href="/faq?section=item-2" 
                            target="_blank"
                            className="text-gray-500 hover:text-gray-700"
                        >How?</a></p>
                    </div>
                    <DropArea
                    uploadedFiles={uploadedFiles}
                    onDrop={onDrop}
                    removeFile={removeFile}
                    accept={{
                        'application/x-bibtex': ['.bib', '.bibtex'],
                        'application/x-research-info-systems': ['.ris']
                    }}
                />
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}


            


            </div>

            

            

            

            <Button 
                onClick={handleSubmit} 
                disabled={isLoading || getAllDois().length === 0}
                className="w-full mt-4"
            >
                {isLoading ? 'Loading...' : `Submit ${getAllDois().length > 0 ? `${getAllDois().length} DOIs` : 'DOIs'}`}
            </Button>

            {getAllDois().length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <p className="text-gray-500 text-xs py-1">{getAllDois().length} DOIs identified:</p>
                        {getAllDois().slice(0, 3).map((doi) => (
                            <div
                                key={doi}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                            >
                                <span>{doi}</span>
                            </div>
                        ))}
                        {getAllDois().length > 3 && (
                            <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium">
                                <span>+{getAllDois().length - 3} more DOIs identified</span>
                            </div>
                        )}
                    </div>
                )}
        </div>
    )
}