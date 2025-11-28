/**
 * Google Translate Crash Fix for React
 * 
 * Google Translate modifies the DOM by wrapping text nodes in <font> tags.
 * This confuses React's reconciliation process, causing "NotFoundError: Failed to execute 'removeChild' on 'Node'"
 * when React tries to update/remove text nodes that have been moved/wrapped.
 * 
 * This script patches DOM methods to prevent the app from crashing (White Screen of Death).
 */

if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (child.parentNode !== this) {
      if (console) {
        console.warn('Google Translate Fix: Suppressed removeChild error. Child is not a child of this node.', child, this);
      }
      // Return the child to satisfy the method signature, even though it wasn't removed from 'this'
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.warn('Google Translate Fix: Suppressed insertBefore error. Reference node is not a child of this node.', referenceNode, this);
      }
      // Fallback: Append to the end if reference node is missing/moved
      // This might change order but prevents crash
      return this.appendChild(newNode);
    }
    return originalInsertBefore.apply(this, arguments);
  };
}