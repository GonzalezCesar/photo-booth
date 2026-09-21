"use client";

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ open, onClose }: ComingSoonModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
          <span className="text-3xl">🖨️</span>
        </div>
        <h2 className="text-xl font-semibold text-white">¡Próximamente!</h2>
        <p className="mt-2 text-sm text-zinc-400">
          La impresión directa estará disponible en una futura actualización.
          Por ahora, puedes descargar tu foto en alta resolución.
        </p>
        <button
          onClick={onClose}
          className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
