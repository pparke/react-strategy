
/**
 * Adds an event listeners to handle when the page loses
 * and regains focus or becomes hidden or visible. Best used
 * for pausing game execution when the user switches to another
 * window or tab.
 * @param  {function} hidden  - handler for when the content is not visible
 * @param  {function} visible - handler for when the content becomes visible
 */
export function onHidden(hidden, visible) {
  if (typeof visible !== 'function') {
    visible = hidden;
  }
  window.addEventListener('focus', visible);
  window.addEventListener('blur', hidden);
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      hidden();
    }
    else {
      visible();
    }
  });
}
