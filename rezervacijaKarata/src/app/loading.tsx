export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-2xl p-6 shadow-md"
        >
          <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}