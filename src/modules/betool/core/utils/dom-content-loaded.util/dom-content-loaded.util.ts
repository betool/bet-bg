export function domContentLoaded(window: Window): Promise<void> {
  return new Promise((resolve) => {
    if (window.document.readyState !== 'complete') {
      window.document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
      resolve();
    }
  });
}
