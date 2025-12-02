import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
  const isResizeObserverError = err.message.includes('ResizeObserver');
  const isPromiseTimeout = err.message.includes('timeout of') && err.message.includes('exceeded');

  if (isResizeObserverError || isPromiseTimeout) {
    return false;
  }

  return true;
});
