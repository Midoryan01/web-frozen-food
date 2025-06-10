export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-300 border-t-slate-600" />
    </div>
  );
}