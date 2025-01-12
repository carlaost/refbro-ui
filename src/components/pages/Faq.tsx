import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useEffect, useState } from 'react'

export default function Faq() {
    const [openSections, setOpenSections] = useState<string[]>([])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const section = params.get('section')
        if (section) {
            setOpenSections([section])
        }
    }, [])

    return (
        <div className="flex flex-col items-start justify-center w-full mx-auto pt-12 gap-4 max-w-lg pb-52">

            <div className="w-full flex flex-col gap-2 text-left">
                <h1 className="text-2xl font-black tracking-tight">Frequently asked questions</h1>
                <p className="text-gray-500">Stuff you probably want to know.</p>
            </div>

            <Accordion 
                type="multiple" 
                className="w-full"
                value={openSections}
                onValueChange={setOpenSections}
            >
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <h2>How can I paste DOIs to Oshima?</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <p>When pasting DOIs you can separate them by space, comma or newline. You can even paste the raw contents of a bibtex file. You can find DOIs in several places:</p>
                            <div className="flex flex-col gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">DOIs can be found on the title page of most papers</p>
                                    <video
                                        src="pdf.mp4"
                                        className="w-full h-auto rounded-lg shadow-md"
                                        muted
                                        autoPlay
                                        loop
                                        controls={false}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Most journal and preprint websites display DOIs prominently</p>
                                    <video
                                        src="arxiv.mp4"
                                        className="w-full h-auto rounded-lg shadow-md"
                                        muted
                                        autoPlay
                                        loop
                                        controls={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionTrigger>
                        <h2>How do I upload a BibTeX or RIS file?</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <p>Follow these 3 quick steps to export and upload your references:</p>
                            <div className="flex flex-col gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">1. Export your Zotero collection via right-click &gt; Export collection</p>
                                    <img
                                        src="step-1.png"
                                        alt="Export collection from Zotero"
                                        className="w-full h-auto rounded-lg shadow-md"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">2. Save as BibTeX (.bib) or RIS (.ris) file</p>
                                    <img
                                        src="step-2.png"
                                        alt="Save as BibTeX or RIS"
                                        className="w-full h-auto rounded-lg shadow-md"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">3. Upload your file to Oshima</p>
                                    <video
                                        src="upload.mp4"
                                        className="w-full h-auto rounded-lg shadow-md"
                                        muted
                                        autoPlay
                                        loop
                                        controls={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionTrigger>
                        <h2>Can I paste the contents of a BibTeX or RIS file directly?</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <p>Yes! You can paste the contents of a .bib or .ris file directly into the text area:</p>
                            <div className="w-full">
                                <video
                                    src="bibtex.mp4"
                                    className="w-full max-w-md h-auto rounded-lg shadow-md mx-auto"
                                    muted
                                    autoPlay
                                    loop
                                    controls={false}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
    )
}