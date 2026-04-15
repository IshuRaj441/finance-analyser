export default function TestTailwind() {
  return (
    <div className="p-8 bg-surface-100 min-h-screen">
      <h1 className="text-3xl font-bold text-primary-600 mb-4">
        Tailwind Test
      </h1>
      <div className="glass p-6 rounded-xl">
        <p className="text-text-primary">
          If you can see this with proper styling, Tailwind is working!
        </p>
        <button className="btn-primary mt-4">
          Test Button
        </button>
      </div>
    </div>
  );
}
