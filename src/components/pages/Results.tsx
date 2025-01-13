import { useLocation, Navigate } from 'react-router-dom'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { ExternalLink } from "lucide-react";
import { Input } from '../ui/input';
import { useState, useEffect } from 'react'

interface Paper {
    title?: string;
    doi: string | null;
    year: number;
    score: number;
    authors?: string;
    journal?: string;
    abstract?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Results() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedbackRating, setFeedbackRating] = useState<string>('')
    const [feedbackText, setFeedbackText] = useState('')
    const [feedbackEmail, setFeedbackEmail] = useState('')
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false)
    
    const location = useLocation()
    const papers = location.state?.papers

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFeedback(true)
        }, 10000)

        return () => clearTimeout(timer)
    }, [])

    // Redirect to search if accessed directly without papers
    if (!papers) {
        return <Navigate to="/" replace />
    }

    const handleDoiClick = (e: React.MouseEvent, doi: string) => {
        e.stopPropagation(); // Prevent accordion from triggering
        window.open(`https://dx.doi.org/${doi}`, '_blank');
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate email
        if (!email || !email.includes('@')) {
            setSubmitStatus('error')
            return
        }

        // Validate papers
        if (!Array.isArray(papers) || papers.length === 0) {
            setSubmitStatus('error')
            return
        }

        setIsSubmitting(true)
        setSubmitStatus('idle')

        try {
            // Log the request for debugging
            console.log('Request URL:', `${API_URL}/send-results`)
            console.log('Request body:', {
                email: email.trim(),
                papers: papers.map((paper: Paper) => ({
                    title: paper.title || 'Untitled',
                    authors: paper.authors || 'Unknown authors',
                    year: paper.year,
                    journal: paper.journal || 'Unknown journal',
                    doi: paper.doi,
                    abstract: paper.abstract,
                    score: paper.score
                }))
            })

            const response = await fetch(`${API_URL}/send-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    papers: papers.map((paper: Paper) => ({
                        title: paper.title || 'Untitled',
                        authors: paper.authors || 'Unknown authors',
                        year: paper.year,
                        journal: paper.journal || 'Unknown journal',
                        doi: paper.doi,
                        abstract: paper.abstract,
                        score: paper.score
                    }))
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to send email')
            }

            setSubmitStatus('success')
            setEmail('')
        } catch (error) {
            console.error('Error sending email:', error)
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFeedbackSubmit = async () => {
        // Require either rating or text feedback
        if (!feedbackRating && !feedbackText) return

        setIsFeedbackSubmitting(true)
        try {
            const response = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: feedbackRating || null,
                    feedback: feedbackText || null,
                    email: feedbackEmail || null,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to submit feedback')
            }

            setShowFeedback(false)
        } catch (error) {
            console.error('Error submitting feedback:', error)
        } finally {
            setIsFeedbackSubmitting(false)
        }
    }

    return (
        <>
            <div className="flex flex-col items-start justify-center max-w-3xl mx-auto pt-20 gap-4 pb-52 px-8">
                <div className="flex flex-col gap-2 items-start text-left">
                    <h1 className="text-2xl font-black tracking-tight">{papers.length} relevant papers found</h1>
                    <p className="text-gray-500">Based on the papers you've been reading, we've found {papers.length} relevant papers for you to read.</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="w-full  text-left mb-12">
                    <label htmlFor="email" className="text-gray-500 text-sm">Send results to my email</label>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col md:flex-row gap-2 max-w-lg">
                            <Input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                            />
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending...' : 'Send'}
                            </Button>
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={() => setShowFeedback(true)}
                                className="md:ml-6"
                            >
                                Leave Feedback
                            </Button>
                        </div>
                        {submitStatus === 'success' && (
                            <p className="text-sm text-green-600">Results sent to your email!</p>
                        )}
                        {submitStatus === 'error' && (
                            <p className="text-sm text-red-600">Failed to send email. Please try again.</p>
                        )}
                    </div>
                </form>
                
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
                                    <p className="text-sm text-gray-500 font-normal">
                                        {paper.authors} • {paper.year} • {paper.journal}
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

            <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>How was your experience?</DialogTitle>
                        <DialogDescription>
                            Please share your feedback to help us improve.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <RadioGroup
                            value={feedbackRating}
                            onValueChange={setFeedbackRating}
                            className="grid grid-cols-4 gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="bad" id="bad" />
                                <Label htmlFor="bad">Bad</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ok" id="ok" />
                                <Label htmlFor="ok">OK</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="good" id="good" />
                                <Label htmlFor="good">Good</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="excellent" id="excellent" />
                                <Label htmlFor="excellent">Excellent</Label>
                            </div>
                        </RadioGroup>
                        <div className="grid gap-2">
                            <Label htmlFor="feedback">Additional feedback</Label>
                            <Textarea
                                id="feedback"
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Tell us what you think..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="feedbackEmail">Email (optional)</Label>
                            <Input
                                id="feedbackEmail"
                                type="email"
                                value={feedbackEmail}
                                onChange={(e) => setFeedbackEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowFeedback(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleFeedbackSubmit}
                            disabled={(!feedbackRating && !feedbackText) || isFeedbackSubmitting}
                        >
                            {isFeedbackSubmitting ? 'Submitting...' : 'Submit feedback'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}