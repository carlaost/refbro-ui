import { useDropzone, DropzoneOptions } from 'react-dropzone'
import { Button } from "./button"
import { X } from "lucide-react"

interface DropAreaProps {
    uploadedFiles: File[]
    onDrop: DropzoneOptions['onDrop']
    removeFile: (fileName: string) => void
    accept?: DropzoneOptions['accept']
}

export function DropArea({ uploadedFiles, onDrop, removeFile, accept }: DropAreaProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept
    })

    return (
        <div 
            {...getRootProps()} 
            className={`border border-dashed rounded-lg text-center text-sm text-gray-500 cursor-pointer w-full h-24 relative flex items-center justify-center
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
        >
            <input {...getInputProps()} />
            <p>Drag and drop your BibTeX or RIS files here, or click to select</p>
            <div className="flex flex-wrap gap-2 mt-2 p-1 absolute bottom-0 left-0">
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
    )
} 