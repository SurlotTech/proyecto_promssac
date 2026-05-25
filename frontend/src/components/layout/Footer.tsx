const Footer = () => (
  <footer className="mt-auto border-t border-white/5 px-4 py-4 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500/80">
          Desarrollado por{" "}
          <span className="font-semibold text-gray-500/80">Sulort Tech S.A.C</span>
        </span>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-gray-500/80">
        <span>v1.0</span>
        <span className="text-gray-500/80">|</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
