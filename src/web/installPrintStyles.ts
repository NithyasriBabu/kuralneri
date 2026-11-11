const PRINT_STYLE_ID = 'kuralneri-print-styles';

export function installPrintStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(PRINT_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      html, body, #root,
      [data-testid="print-shell"],
      [data-testid="print-canvas"],
      [data-testid="print-screen"],
      [data-testid="print-scroll-container"] {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }

      [data-testid="app-navigation"] {
        display: none !important;
      }

      [data-testid="print-scroll-container"] > div {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }
    }
  `;
  document.head.appendChild(style);
}
