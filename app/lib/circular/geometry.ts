type Bounds={left:number;top:number;right:number;bottom:number};
// Parser paths use mask-raster coordinates; place them in source-image pixels.
export function maskTransform(bounds:Bounds,width:number,height:number) {
  if(![bounds.left,bounds.top,bounds.right,bounds.bottom,width,height].every(Number.isFinite)||width<=0||height<=0||bounds.right<=bounds.left||bounds.bottom<=bounds.top) throw new Error('Invalid mask bounds');
  return `translate(${bounds.left} ${bounds.top}) scale(${(bounds.right-bounds.left)/width} ${(bounds.bottom-bounds.top)/height})`;
}
