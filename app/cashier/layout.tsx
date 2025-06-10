import { ReactNode } from 'react';


export default function CashierLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {children}
    </div>
  );
}

