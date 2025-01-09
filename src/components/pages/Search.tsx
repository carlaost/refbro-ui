import { useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react" // For the remove X icon
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDropzone } from 'react-dropzone'

// Add constant for DOI regex pattern
const DOI_REGEX = /(?:https?:\/\/doi\.org\/|(?:doi:)?)?(10\.\d{4,}(?:\.\d+)*\/[-%\w.()]+)(?:[^-%\w.()]|$)/g

interface Recommendation {
    title?: string;
    doi: string | null;
    publication_year: number;
    score: number;
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

export default function Search() {
    const navigate = useNavigate()
    const [inputText, setInputText] = useState("")
    const [queryText, setQueryText] = useState("")
    const [doiSources, setDoiSources] = useState<DoiSource[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    // Helper function to get all unique DOIs
    const getAllDois = useCallback(() => {
        return [...new Set(doiSources.flatMap(source => source.dois))]
    }, [doiSources])

    // Update extractDois to handle pasted DOIs
    const handlePastedDois = (text: string) => {
        const matches = [...new Set(
            Array.from(text.matchAll(DOI_REGEX), match => match[1])
        )]
        
        setDoiSources(prev => {
            const newSources = prev.filter(source => source.type !== 'pasted')
            return [...newSources, { type: 'pasted', dois: matches }]
        })
    }

    const handleSubmit = async () => {
        const allDois = getAllDois()
        if (allDois.length === 0) return
        
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/openalex/fetchMetadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dois: allDois }),
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

    const handleQuerySubmit = async () => {
        if (!queryText.trim()) return
        
        setIsLoading(true)
        setError(null)
        
        const queries = queryText.split(',').map(q => q.trim()).filter(q => q)
        console.log('Submitting queries:', queries)

        try {
            const response = await fetch('https://refbro.onrender.com/queries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ queries })
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch query results: ${response.statusText}`)
            }

            const data = await response.json()
            // Transform the recommendations to match the Paper interface
            const papers = data.recommendations.map((rec: Recommendation) => ({
                title: rec.title || 'No title available',
                authors: [], // API doesn't provide authors currently
                year: rec.publication_year?.toString() || 'Unknown',
                journal: '', // API doesn't provide journal currently
                doi: rec.doi || '',
                abstract: '' // API doesn't provide abstract currently
            }))
            
            navigate('/results', { state: { papers } })

        } catch (err) {
            console.error('Error details:', err)
            setError('Failed to fetch query results')
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
        <div className="flex flex-col items-start justify-center max-w-lg mx-auto pt-20 gap-4">


            <div className="flex flex-col items-start text-left mb-4">
                <h1 className="text-2xl font-black tracking-tight">Find new papers to read based on your current interests</h1>
                <p className="text-gray-500">Oshima is a research paper recommender that keeps you updated with the latest research in your field. Provide some papers you've been reading or saving below to receive your first recommendation.</p>
            </div>


            <Tabs defaultValue="upload" className="w-full">
                <TabsList>
                    <TabsTrigger value="upload">Upload references</TabsTrigger>
                    <TabsTrigger value="paste">Paste paper DOIs</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="w-full flex flex-col gap-2 text-left text-sm text-gray-500">
                    Upload a BibTeX or RIS file containing relevant papers below.
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
                <TabsContent value="paste" className="w-full flex flex-col gap-2 text-left text-sm text-gray-500">
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


            

            <div className="grid w-full gap-2 mt-52">
                <Textarea 
                    placeholder="Paste keyword sets here. Separate with commas." 
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                />

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button 
                    onClick={handleQuerySubmit} 
                    disabled={isLoading || !queryText.trim()}
                >
                    {isLoading ? 'Loading...' : 'Submit queries'}
                </Button>
            </div>
        </div>
    )
}