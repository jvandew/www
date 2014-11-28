function preload(arrayOfImages) {
  $(arrayOfImages).each(function(){
    $('<img/>')[0].src = this;
  });
}

preload([
  'static/card/images/shadow.png',
  'static/card/images/mount-center.png',
  'static/card/images/houses.png',
  'static/card/images/windows-light.png',
  'static/card/images/windows-dark.png',
  'static/card/images/rink.png',
  'static/card/images/rink-front.png',
  'static/card/images/tree.png',
  'static/card/images/general-light.png',
]);

$(window).load(function() {

  $('#start').addClass('active');

  function playCard(){
    $('.card').removeClass('active').addClass('inactive');
    $('#replay').removeClass('active');
    setTimeout(function(){
      $('.card').removeClass('inactive').addClass('active')
    }, 50);
    $('audio')[0].play();
    setTimeout(function(){
      $('#replay').addClass('active');
    }, 15000);
  }

  $('body').on('click', '#start.active', function(){
    $('#start').removeClass('active');
    playCard();
  });

  $('body').on('click', '#replay.active', function(){
    playCard();
  });

});

