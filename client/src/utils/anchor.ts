export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Placement {
  top: number;
  left: number;
  /** Where the floating box sits relative to its anchor. */
  side: 'above' | 'below';
}

/**
 * Places a floating box (tooltip, popover) next to its anchor, in window coordinates: centred above the anchor, flipped
 * below when there is no room above, and kept `margin` px inside the window edges.
 */
export function placeAnchored(anchor: Box, floating: Pick<Box, 'width' | 'height'>, view: Pick<Box, 'width' | 'height'>, gap = 6, margin = 8): Placement {
  const fitsAbove = anchor.top - gap - floating.height >= margin;
  const side = fitsAbove ? 'above' : 'below';
  const top = side === 'above' ? anchor.top - gap - floating.height : anchor.top + anchor.height + gap;
  const centred = anchor.left + anchor.width / 2 - floating.width / 2;
  const maxLeft = Math.max(margin, view.width - margin - floating.width);
  const left = Math.min(Math.max(centred, margin), maxLeft);
  return { top: Math.min(top, Math.max(margin, view.height - margin - floating.height)), left, side };
}
