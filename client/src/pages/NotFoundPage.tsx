import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-6">
      <h1 className="text-6xl font-bold">404</h1>

      <p>Halaman tidak ditemukan.</p>

      <Link
        to="/"
        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-400 transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}