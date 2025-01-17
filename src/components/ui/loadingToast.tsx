import { Loader2 } from "lucide-react"

export default function LoadingToast() {
    return(
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="flex flex-col gap-2 bg-background h-40 rounded-md w-full max-w-md items-center justify-center">
                <Loader2 className="animate-spin" size={32}/>
                <p>Getting recommendations...</p>
            </div>
        </div>
    )
}