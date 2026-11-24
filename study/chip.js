function drawChip(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bounds = canvas.getBoundingClientRect();
  const width = bounds.width || 225;
  const height = bounds.height || 116;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const scale = Math.min(width / 225, height / 116);
  ctx.setTransform(ratio * scale, 0, 0, ratio * scale,
    ratio * (width - 225 * scale) / 2, ratio * (height - 116 * scale) / 2);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // All package layers share these axes, including the lettering on the lid.
  const top = (x, y, z = 0) => [109 + 1.09 * x - 0.98 * y, 33 + 0.41 * x + 0.53 * y - z];
  function path(points, fill, stroke, lineWidth = 0.9) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    if (fill) {
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function ring(x, y, radius, fill, stroke, lineWidth = 0.8) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  // Faint board traces leave plenty of transparent space around the package.
  const traces = [
    [[10, 47], [28, 47], [36, 53], [61, 53]],
    [[8, 69], [25, 69], [38, 60], [60, 60]],
    [[24, 87], [35, 87], [51, 75], [70, 75]],
    [[155, 50], [179, 50], [194, 39], [209, 39]],
    [[155, 60], [182, 60], [192, 66], [217, 66]],
    [[149, 81], [176, 81], [186, 88], [204, 88]]
  ];
  for (const [index, trace] of traces.entries()) {
    path(trace, null, '#a6c9ad', 0.85);
    const [x, y] = index < 3 ? trace[0] : trace.at(-1);
    ring(x, y, 1.55, '#e2efe0', '#a6c9ad');
  }

  ctx.save();
  ctx.translate(112, 80);
  ctx.scale(1, 0.26);
  const shadow = ctx.createRadialGradient(0, 0, 5, 0, 0, 72);
  shadow.addColorStop(0, 'rgba(35, 70, 52, .24)');
  shadow.addColorStop(1, 'rgba(35, 70, 52, 0)');
  ctx.fillStyle = shadow;
  ctx.fillRect(-72, -72, 144, 144);
  ctx.restore();

  // A gull-wing lead bends down the side of the package before meeting its pad.
  function lead(x, y, dx, dy) {
    const point = (distance, z) => top(x + distance * dx, y + distance * dy, z);
    const metal = [point(0, 5.8), point(2.5, 5.8), point(5, 0.9), point(8.5, 0.9)];
    path(metal, null, '#48665c', 2.05);
    path(metal.map(([px, py]) => [px, py - 0.42]), null, '#c5d2c3', 1.12);
  }
  for (let pin = 4; pin <= 60; pin += 4) {
    lead(pin, 0, 0, -1);
    lead(0, pin, -1, 0);
    lead(pin, 64, 0, 1);
    lead(64, pin, 1, 0);
  }

  // The beveled outline is clockwise, beginning at the back left corner.
  function layer(min, max, bottom, rim, cut, colors) {
    const corners = [
      [min + cut, min], [max - cut, min], [max, min + cut], [max, max - cut],
      [max - cut, max], [min + cut, max], [min, max - cut], [min, min + cut]
    ];
    const edge = corners.map(([x, y]) => top(x, y, rim));
    const base = corners.map(([x, y]) => top(x, y, bottom));
    for (let i = 1; i < 6; i++) {
      path([edge[i], edge[i + 1], base[i + 1], base[i]], colors[i] || colors[3], '#31594a', 0.69);
    }
    path(edge, colors[0], '#31594a', 0.93);
  }
  layer(0, 64, 2, 6, 2, ['#72987b', '#6c967a', '#688c73', '#528167', '#386652', '#48765e']);
  layer(0.5, 63.5, 6.2, 8, 1.9, ['#a2bc9a', '#87a784', '#7b9c79', '#8daf88', '#789773', '#759774']);
  layer(2.7, 61.3, 8, 14, 4, ['#79a88a', '#6a967b', '#568268', '#57866c', '#456f59', '#568169']);

  // Short etched lines and four alignment pads accent the exposed substrate.
  const etch = (coords, color, lineWidth) => path(coords.map(([x, y]) => top(x, y, 14.3)), null, color, lineWidth);
  for (let pad = 14; pad <= 50; pad += 4) {
    etch([[5.4, pad], [8.1, pad]], '#a8c4a7', 0.82);
    etch([[pad, 58.6], [pad, 55.8]], '#567e66', 0.82);
  }
  for (const [x, y] of [[7.5, 8], [56, 7.5], [56, 56], [8, 56]]) {
    const [px, py] = top(x, y, 14.3);
    ctx.beginPath();
    ctx.ellipse(px, py, 1.85, 0.92, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d7ddac';
    ctx.fill();
    ctx.strokeStyle = '#466e59';
    ctx.lineWidth = 0.52;
    ctx.stroke();
  }

  layer(9, 55, 14.2, 16.2, 2.5, ['#729e83', '#6b9176', '#64876c', '#789e81', '#5f846c', '#6b9176']);
  const lid = ctx.createLinearGradient(80, 31, 135, 59);
  lid.addColorStop(0, '#e1eee1');
  lid.addColorStop(0.52, '#c9dfc8');
  lid.addColorStop(1, '#b4d1b3');
  layer(11, 53, 16.3, 18, 2.7, [lid, '#bcd4ba', '#a9c6aa', '#9bb99f', '#89ad94', '#aec9ac']);

  ctx.save();
  const origin = top(0, 0, 18.2);
  ctx.transform(1.09, 0.41, -0.98, 0.53, ...origin);
  path([[16, 24], [16, 17], [23, 17]], null, '#719580', 0.78);
  path([[48, 40], [48, 47], [41, 47]], null, '#719580', 0.78);
  ctx.font = 'bold 21px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ebf3e7';
  ctx.fillText('OS', 32.3, 33.5);
  ctx.fillStyle = '#345d4d';
  ctx.fillText('OS', 32, 32.8);
  ctx.restore();
}
