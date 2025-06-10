import Spinner from "./components/Spinner";

export default function Loading() {

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-slate-900/20 backdrop-blur-sm">
      <Spinner />
    </div>
  );
}