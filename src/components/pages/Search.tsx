import { useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDropzone } from 'react-dropzone'

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

export default function Search() {
    const navigate = useNavigate()
    const [inputText, setInputText] = useState("")
    const [doiSources, setDoiSources] = useState<DoiSource[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')

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
            const response = await fetch(`${API_URL}/v1/colab`, {
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/x-bibtex': ['.bib', '.bibtex'],
            'application/x-research-info-systems': ['.ris']
        }
    })

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
        <div className="flex flex-col items-start justify-center w-full mx-auto pt-12 gap-4">

            <div className="max-w-lg mx-auto flex flex-col gap-2 mb-24">

            <div className="flex flex-col items-start text-left mb-8">
                <h1 className="text-2xl font-black tracking-tight">Find new papers to read based on your current reading list </h1>
                <p className="text-gray-500 ">Oshima is a research paper recommender that keeps you updated with the latest research in your field. You can upload a reference file or paste a list of DOIs or an entire .bib or .ris file. Oshima will find other papers that might interest you.</p>
            </div>


            <Tabs 
                defaultValue="upload" 
                className="w-full"
                onValueChange={(value) => setActiveTab(value as 'upload' | 'paste')}
                value={activeTab}
            >
                <TabsList>
                    <TabsTrigger value="upload">Upload file</TabsTrigger>
                    <TabsTrigger value="paste">Paste text</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="w-full flex flex-col gap-2 text-left text-gray-500">
                    Upload a BibTeX or RIS file from your reference manager.
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg pt-6 text-center cursor-pointer
                            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
                    >
                        <input {...getInputProps()} />
                        <p>Drag and drop your BibTeX or RIS files here, or click to select</p>
                        <p className="text-xs text-gray-400 mt-2 pb-4">Supported formats: .bib, .bibtex, .ris</p>
                        <div className="flex flex-wrap gap-2 mt-2 p-1">
                        {uploadedFiles.map((file) => (
                            <div 
                                key={file.name}
                                className="flex items-center gap-1 px-2 py-0 bg-gray-500 text-white rounded-md h-6 text-xs"
                            >
                                <span>{file.name}</span>
                                <Button 
                                    variant="ghost"
                                    onClick={() => removeFile(file.name)}
                                    className="hover:text-red-500 p-0 rounded-full bg-transparent hover:bg-transparent h-6"
                                >
                                    <X size={10} />
                                </Button>
                            </div>
                        ))}
                    </div>
                    </div>

                    
                </TabsContent>
                <TabsContent value="paste" className="w-full flex flex-col gap-2 text-left text-gray-500">
                    Paste the DOIs of relevant papers below. Don't worry about formatting, we know a DOI when we see one.
                    <Textarea 
                        placeholder="https://doi.org/10.2172/1216566, doi.org/10.1000/182, 10.1025/23456654" 
                        value={inputText}
                        onChange={handleTextareaChange}
                    />
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2">
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

            <Button 
                onClick={handleSubmit} 
                disabled={isLoading || getAllDois().length === 0}
                className="w-full"
            >
                {isLoading ? 'Loading...' : `Submit ${getAllDois().length > 0 ? `${getAllDois().length} DOIs` : 'DOIs'}`}
            </Button>
            </div>


                  </div>
    )
}