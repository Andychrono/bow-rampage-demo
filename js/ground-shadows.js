/* Soft ground shadows. Sprite silhouettes are cached and reused between frames. */
window.GroundShadows = (() => {
  const silhouettes = new WeakMap();

  function oval(ctx, x, y, rx, ry, opacity, angle = 0) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(rx,ry);
    const shade = ctx.createRadialGradient(0,0,0,0,0,1);
    shade.addColorStop(0,'rgba(7,10,15,'+opacity+')');
    shade.addColorStop(.45,'rgba(7,10,15,'+(opacity*.8)+')');
    shade.addColorStop(1,'rgba(7,10,15,0)');
    ctx.fillStyle = shade;
    ctx.fillRect(-1,-1,2,2);
    ctx.restore();
  }

  function silhouette(body, overlay, height) {
    if (!body?.complete || !body.naturalWidth) return null;
    const layer = overlay?.complete && overlay.naturalWidth ? overlay : null;
    const cached = silhouettes.get(body);
    if (cached?.layer === layer && cached.height === height) return cached;
    const width = Math.ceil(height * body.naturalWidth / body.naturalHeight);
    const padding = 12;
    const mask = document.createElement('canvas');
    mask.width = width + padding*2;
    mask.height = height + padding*2;
    const maskCtx = mask.getContext('2d');
    maskCtx.drawImage(body,padding,padding,width,height);
    if (layer) maskCtx.drawImage(layer,padding,padding,width,height);
    maskCtx.globalCompositeOperation = 'source-in';
    maskCtx.fillStyle = '#080b13';
    maskCtx.fillRect(0,0,mask.width,mask.height);

    const soft = document.createElement('canvas');
    soft.width = mask.width;
    soft.height = mask.height;
    const softCtx = soft.getContext('2d');
    softCtx.filter = 'blur(3px)';
    softCtx.drawImage(mask,0,0);
    const entry = {layer,height,image:soft};
    silhouettes.set(body,entry);
    return entry;
  }

  function hero(ctx, body, overlay, height, angle) {
    oval(ctx,1,12,43,27,.42);
    const cast = silhouette(body,overlay,height);
    if (cast) {
      ctx.save();
      ctx.translate(12,18);
      ctx.scale(1,.64);
      ctx.rotate(angle);
      ctx.globalAlpha *= .46;
      ctx.drawImage(cast.image,-cast.image.width/2,-cast.image.height/2);
      ctx.restore();
    }
    oval(ctx,0,9,29,16,.60);
  }

  function creature(ctx, x, y, rx, ry, jump, opacity = .46) {
    const lift = Math.max(0,Math.min(1,jump));
    oval(ctx,x+7+lift*7,y+4+lift*6,rx*(1.52-lift*.18),ry*(1.65+lift*.28),opacity*(.93-lift*.52));
    if (lift < 1) oval(ctx,x,y,rx*(1.08-lift*.24),ry*1.08,opacity*.9*(1-lift));
  }

  function flying(ctx, sprite, size, angle, diving = false) {
    const x = diving ? 9 : 17;
    const y = diving ? 24 : 42;
    oval(ctx,x,y,size*.35,size*.15,diving ? .44 : .29,angle*.25);
    const cast = silhouette(sprite,null,size);
    if (!cast) return;
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(.78,diving ? .53 : .40);
    ctx.rotate(angle);
    ctx.globalAlpha *= diving ? .31 : .22;
    ctx.drawImage(cast.image,-cast.image.width/2,-cast.image.height/2);
    ctx.restore();
  }

  function hovering(ctx, sprite, size, angle, opacity = 1) {
    // Move the projection beyond the sprite's lower edge so the object cannot hide its own shadow.
    oval(ctx,12,36,size*.47,size*.19,.30*opacity);
    // Use one cached mask for every orbit position; perspective varies continuously.
    const maskHeight = 80;
    const cast = silhouette(sprite,null,maskHeight);
    if (cast) {
      ctx.save();
      ctx.translate(12,36);
      ctx.scale(size/maskHeight,.48*size/maskHeight);
      ctx.rotate(angle);
      ctx.globalAlpha *= .43*opacity;
      ctx.drawImage(cast.image,-cast.image.width/2,-cast.image.height/2);
      ctx.restore();
    }
    oval(ctx,9,33,size*.25,size*.10,.22*opacity);
  }

  return {oval,hero,creature,flying,hovering};
})();
