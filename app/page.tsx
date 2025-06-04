// app/tailwind-test/page.tsx

export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-10">
      <div className="bg-sky-600 text-white p-8 rounded-xl shadow-2xl text-center max-w-md">
        <h1 className="text-5xl font-extrabold mb-6 animate-pulse">
          Test Tailwind CSS!
        </h1>
        <p className="text-xl mb-4">
          Jika halaman ini memiliki latar belakang abu-abu muda, kotak ini berwarna biru langit dengan teks putih, padding, sudut membulat, bayangan, dan teks judul besar serta berdenyut, maka Tailwind CSS Anda sudah berjalan dengan benar!
        </p>
        <div className="mt-8 space-x-4">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-150">
            Tombol Keren
          </button>
          <button className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-150">
            Tombol Lain
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-white border-4 border-dashed border-purple-400 rounded-lg w-full max-w-md">
        <p className="text-purple-700 text-center">
          Area tes lain dengan <span className="font-bold text-red-600">style berbeda</span> untuk memastikan kelas utilitas berfungsi.
        </p>
        <div className="mt-4 flex justify-around">
          <div className="w-16 h-16 bg-yellow-400 rounded-full shadow-lg"></div>
          <div className="w-16 h-16 bg-teal-400 rounded-md shadow-lg"></div>
          <div className="w-16 h-16 bg-rose-400 rounded-sm shadow-lg"></div>
        </div>
      </div>

      <p className="mt-10 text-xs text-gray-500">
        Pastikan file <code className="bg-gray-300 px-1 rounded">app/globals.css</code> Anda sudah benar (dengan <code className="bg-gray-300 px-1 rounded">@tailwind base;</code> dkk.) dan diimpor di <code className="bg-gray-300 px-1 rounded">app/layout.tsx</code>.
        Juga, <code className="bg-gray-300 px-1 rounded">tailwind.config.ts</code> harus memantau folder <code className="bg-gray-300 px-1 rounded">app</code>.
      </p>
    </div>
  );
}