// A WebView's first navigation must BE the auto-submitting form — unlike the browser
// version of this, there's no live DOM to inject a form into before the page loads.
export function buildAutoSubmitHtml(postUrl: string, fields: Record<string, string>): string {
  const inputs = Object.entries(fields)
    .map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}" />`)
    .join('\n')
  return `<!DOCTYPE html><html><body onload="document.forms[0].submit()">
<form method="POST" action="${escapeHtml(postUrl)}">${inputs}</form>
</body></html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
