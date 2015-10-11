$(document).ready(function() {

  var winWidth = $(window).width();
  var bodyWidth = winWidth * 4;

  $('section').width(winWidth);
  $('body').width(bodyWidth);

  $.localScroll.defaults.axis = 'xy';
  $.localScroll({
    target: 'body.play', // could be a selector or a jQuery object too.
    queue:true,
    duration:1000,
    hash:true,
    onBefore:function( e, anchor, $target ){
      // The 'this' is the settings object, can be modified
    },
    onAfter:function( anchor, settings ){
      // The 'this' contains the scrolled element (#content)
    }
  });



});