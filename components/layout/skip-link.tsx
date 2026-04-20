/**
 * Skip-link accesible: oculto visualmente hasta recibir foco por teclado.
 * Permite a usuarios con lector de pantalla o teclado saltarse la navegación
 * y llegar directo al contenido principal.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
    >
      Saltar al contenido
    </a>
  );
}
