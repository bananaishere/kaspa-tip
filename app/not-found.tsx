import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-teal-500 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-teal-100 mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Home
      </Link>
    </div>
  )
}

