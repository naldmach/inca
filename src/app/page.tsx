import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-2xl w-full p-8 bg-white rounded-xl shadow-lg text-center mt-24">
        <h1 className="text-4xl font-bold mb-4 text-blue-800">
          Find Your Next Home
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover, list, and manage rental properties with ease. Start your
          journey to a better rental experience today.
        </p>
        <Link href="/properties">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition">
            Browse Properties
          </button>
        </Link>
        <div className="mt-8 text-gray-500 text-sm">
          <span>or </span>
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
          <span> / </span>
          <Link href="/register" className="text-blue-600 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
