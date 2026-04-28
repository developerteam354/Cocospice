export default function AdminFooter() {
  return (
    <footer className="border-t border-white/5 px-6 py-3">
      <p className="text-center text-xs text-slate-600">
        Cocospice Admin &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
