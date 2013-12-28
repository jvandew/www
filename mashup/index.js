/* fb stuff starts here */
var fbFeed;

// Load the SDK Asynchronously
(function(d){
  var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = "//connect.facebook.net/en_US/all.js";
  ref.parentNode.insertBefore(js, ref);
}(document));

window.fbAsyncInit = function() {
  FB.init({
    appId      : '422427301159163',
    channelUrl : '//www.contrib.andrew.cmu.edu/~jvandew/mashup/channel.html', // Channel File
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });

  // Additional init code here
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      testAPI();
    } else if (response.status === 'not_authorized') {
      login();
    } else {
      login();
    }
  });

};

function login() {
  FB.login(function(response) {
    if (response.authResponse) {
      testAPI();
    } else {
      // cancelled
    }
  }, {scope: 'read_stream'});
}

function testAPI() {
  FB.api('/me/home', function(response) {
    fbFeed = response;
    document.getElementById('fb-feed').innerHTML = JSON.stringify(fbFeed);
  });
}
/* fb stuff ends here */

/* Twitter stuff starts here */
/* function authRedirect(data) {
  if (!data['oauth_callback_confirmed']) alert('Callback unconfirmed. Try again');
  else {
    document.cookie = 'token=' + data.oauth_token + '; expires=0; path=/';
    document.cookie = 'token_secret=' + data.oauth_token_secret + '; expires=0; path=/';
    window.location = 'http://twitter.com/oauth/authorize?oauth_token=' + data.oauth_token;
  }
} */

function doTwitter() {
/*  $.ajax({
    dataType: 'json',
    success:  authRedirect,
    type:     'POST',
    url:      'cgi-bin/twitter.cgi'
  })*/
}