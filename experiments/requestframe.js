/*
 * Workaround for requestAnimFrame, which is not universally supported.
 */
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame  ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback, element){
      window.setTimeout(callback, 1000 / 60);
    };
})();

