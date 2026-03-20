import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          NeuraTrack
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          AI-Powered Epilepsy Management Platform
        </p>
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            Count: {count}
          </button>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          Edit{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            src/App.tsx
          </code>{" "}
          to get started
        </p>
      </div>
    </div>
  );
}

export default App;
