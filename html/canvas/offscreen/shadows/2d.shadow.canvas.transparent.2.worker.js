// DO NOT EDIT! This test has been generated by /html/canvas/tools/gentest.py.
// OffscreenCanvas test in a worker:2d.shadow.canvas.transparent.2
// Description:Shadows are not drawn for transparent parts of canvases
// Note:

importScripts("/resources/testharness.js");
importScripts("/html/canvas/resources/canvas-tests.js");

var t = async_test("Shadows are not drawn for transparent parts of canvases");
var t_pass = t.done.bind(t);
var t_fail = t.step_func(function(reason) {
    throw reason;
});
t.step(function() {

  var canvas = new OffscreenCanvas(100, 50);
  var ctx = canvas.getContext('2d');

  var canvas2 = new OffscreenCanvas(100, 50);
  var ctx2 = canvas2.getContext('2d');
  ctx2.fillStyle = '#f00';
  ctx2.fillRect(0, 0, 50, 50);

  ctx.fillStyle = '#0f0';
  ctx.fillRect(0, 0, 50, 50);
  ctx.fillStyle = '#f00';
  ctx.fillRect(50, 0, 50, 50);
  ctx.shadowOffsetY = 50;
  ctx.shadowColor = '#0f0';
  ctx.drawImage(canvas2, 50, -50);
  ctx.shadowColor = '#f00';
  ctx.drawImage(canvas2, -50, -50);

  _assertPixel(canvas, 25,25, 0,255,0,255);
  _assertPixel(canvas, 50,25, 0,255,0,255);
  _assertPixel(canvas, 75,25, 0,255,0,255);
  t.done();
});
done();