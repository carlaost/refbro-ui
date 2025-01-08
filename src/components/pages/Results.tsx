import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { ExternalLink } from "lucide-react";

export default function Results() {

    const papers = [
        {
            title: "Quantum Computing for Everyone",
            authors: ["John Doe", "Jane Smith"],
            abstract: "This paper introduces the basics of quantum computing and its applications.",
            year: 2024,
            journal: "Journal of Quantum Studies",
            doi: "10.1000/quantum123"
        },
        {
            title: "AI in Healthcare: A Review",
            authors: ["Emily Johnson", "Michael Brown"],
            abstract: "This review discusses the current state and future prospects of AI in healthcare.",
            year: 2023,
            journal: "Journal of Medical Informatics",
            doi: "10.1000/aihealth124"
        },
        {
            title: "Climate Change Mitigation Strategies",
            authors: ["Sarah Taylor", "David Lee"],
            abstract: "This paper examines various strategies for mitigating climate change and their effectiveness.",
            year: 2022,
            journal: "Journal of Environmental Science",
            doi: "10.1000/climate125"
        },
        {
            title: "Advances in Renewable Energy",
            authors: ["Kevin White", "Lisa Nguyen"],
            abstract: "This paper highlights recent advances in renewable energy technologies and their potential impact.",
            year: 2021,
            journal: "Journal of Sustainable Energy",
            doi: "10.1000/renewable126"
        },
        {
            title: "Cybersecurity in the IoT Era",
            authors: ["James Davis", "Helen Martin"],
            abstract: "This paper discusses the cybersecurity challenges posed by the Internet of Things and potential solutions.",
            year: 2020,
            journal: "Journal of Cybersecurity Research",
            doi: "10.1000/cyber127"
        }
    ];

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
                {papers.map((paper, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>
                            <div className="text-left flex-1">
                                <div className="flex items-start">
                                    <h2 className="text-lg font-semibold tracking-tight">{paper.title}</h2>
                                    <button
                                        onClick={(e) => handleDoiClick(e, paper.doi)}
                                        className="ml-2 p-1 hover:bg-gray-100 bg-transparent rounded-full"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 font-normal">
                                    {paper.authors.join(', ')} • {paper.year} • {paper.journal}
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {paper.abstract}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}