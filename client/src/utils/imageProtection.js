/**
 * Spread onto any <img> showing a preview that shouldn't be casually
 * saved. This is friction, not security: it stops the basic "right
 * click > Save Image As" and drag-to-desktop paths, and that's genuinely
 * all it does. Anyone using browser dev tools (Network/Elements tab),
 * disabling JavaScript, or just taking a screenshot bypasses this
 * completely — there is no client-side way to prevent that for content
 * that must be visibly rendered in a browser.
 *
 * The only real protection is watermarking the image itself before it's
 * uploaded (spec already calls for this) — this file is a deterrent on
 * top of that, not a replacement for it.
 */
export const noSaveImageProps = {
  onContextMenu: (e) => e.preventDefault(),
  onDragStart: (e) => e.preventDefault(),
  draggable: false,
  className: 'select-none [-webkit-touch-callout:none]',
};
