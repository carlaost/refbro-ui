import { useLocation, Navigate } from 'react-router-dom'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { ExternalLink } from "lucide-react";

interface Paper {
    title: string;
    doi: string | null;
    publication_year: number;
    score: number;
}

export default function Results() {
    const location = useLocation()
    const papers = location.state?.papers

    // Redirect to search if accessed directly without papers
    if (!papers) {
        return <Navigate to="/" replace />
    }

    const handleDoiClick = (e: React.MouseEvent, doi: string) => {
        e.stopPropagation(); // Prevent accordion from triggering
        window.open(`https://dx.doi.org/${doi}`, '_blank');
    };

    return (
        <div className="flex flex-col items-start justify-center max-w-lg mx-auto pt-20 gap-4">
            <div className="flex flex-col items-start text-left">
                <h1 className="text-2xl font-semibold tracking-tight">{papers.length} relevant papers found</h1>
                <p className="text-sm text-gray-500">Based on the papers you've been reading, we've found {papers.length} relevant papers for you to read.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
                {papers.map((paper: Paper, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>
                            <div className="text-left flex-1">
                                <div className="flex items-start">
                                    <h2 className="text-lg font-semibold tracking-tight">{paper.title}</h2>
                                    <button
                                        onClick={(e) => handleDoiClick(e, paper.doi || '')}
                                        className="ml-2 p-1 hover:bg-gray-100 bg-transparent rounded-full"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* <p className="text-sm text-gray-500 font-normal">
                                    {paper.authors.join(', ')} • {paper.year} • {paper.journal}
                                </p> */}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {/* {paper.abstract} */}
                            Abstract goes here.
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}