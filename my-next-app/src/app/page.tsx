import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">UmlTutor</h1>
        <p className="text-sm text-gray-500 mb-8">Choose where to go:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/login" className="block rounded-lg border p-4 hover:bg-gray-50">
            <div className="font-medium">Login</div>
            <div className="text-sm text-gray-500">Sign in to your account</div>
          </Link>
          <Link href="/dashboard" className="block rounded-lg border p-4 hover:bg-gray-50">
            <div className="font-medium">Student Dashboard</div>
            <div className="text-sm text-gray-500">Overview for students</div>
          </Link>
          <Link href="/teacher-dashboard" className="block rounded-lg border p-4 hover:bg-gray-50">
            <div className="font-medium">Teacher Dashboard</div>
            <div className="text-sm text-gray-500">Manage sessions and progress</div>
          </Link>
          <Link href="/diagram-editor" className="block rounded-lg border p-4 hover:bg-gray-50">
            <div className="font-medium">Diagram Editor</div>
            <div className="text-sm text-gray-500">Create and edit diagrams</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
