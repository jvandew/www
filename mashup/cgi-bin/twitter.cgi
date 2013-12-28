#!/usr/bin/python
from hashlib import sha1
import base64, binascii, cgi, hmac, httplib, json, random, time, urllib, urlparse

def escape(s):
    """Escape a URL including any /."""
    return urllib.quote(s.encode('utf-8'), safe='~')

def getNonce():
    return str(random.randint(0, 10000000))

# expects token_secret and base to be URL encoded
def getSignature(base, token_secret=None):
    key = '%s&' % escape('wogw4ITaX0BPPGo8FyvTOmsVGhyzC7qawt9lEQT8V4')
    if token_secret:
        key += escape(token_secret)
    return binascii.b2a_base64(hmac.new(key, base, sha1).digest())[:-1]

def to_unicode(s):
    """ Convert to unicode, raise exception with instructive error
    message if s is not unicode, ascii, or utf-8. """
    if not isinstance(s, unicode):
        if not isinstance(s, str):
            raise TypeError('You are required to pass either unicode or string here, not: %r (%s)' % (type(s), s))
        try:
            s = s.decode('utf-8')
        except UnicodeDecodeError, le:
            raise TypeError('You are required to pass either a unicode object or a utf-8 string here. You passed a Python string object which contained non-utf-8: %r. The UnicodeDecodeError that resulted from attempting to interpret it as utf-8 was: %s' % (s, le,))
    return s

def to_utf8(s):
    return to_unicode(s).encode('utf-8')

def to_utf8_if_string(s):
    if isinstance(s, basestring):
        return to_utf8(s)
    else:
        return s

def split_url_string(param_str):
    """Turn URL string into parameters."""
    parameters = urlparse.parse_qs(param_str.encode('utf-8'), keep_blank_values=True)
    for k, v in parameters.iteritems():
        parameters[k] = urllib.unquote(v[0])
    return parameters

def get_normalized_params(params, url):
    """Return a string that contains the parameters that must be signed."""
    items = []
    for key, value in params.iteritems():
        if key == 'oauth_signature':
            continue
        if isinstance(value, basestring):
            items.append((to_utf8_if_string(key), to_utf8(value)))
        else:
            try:
                value = list(value)
            except TypeError, e:
                assert 'is not iterable' in str(e)
                items.append((to_utf8_if_string(key), to_utf8_if_string(value)))
            else:
                items.extend((to_utf8_if_string(key), to_utf8_if_string(item)) for item in value)

    # Include any query string parameters from the provided URL
    query = urlparse.urlparse(url)[4]

    url_items = split_url_string(query).items()
    url_items = [(to_utf8(k), to_utf8(v)) for k, v in url_items if k != 'oauth_signature' ]
    items.extend(url_items)

    items.sort()
    encoded_str = urllib.urlencode(items)
    # Encode signature parameters per Oauth Core 1.0 protocol
    # spec draft 7, section 3.6
    # (http://tools.ietf.org/html/draft-hammer-oauth-07#section-3.6)
    # Spaces must be encoded with "%20" instead of "+"
    return encoded_str.replace('+', '%20').replace('%7E', '~')

def to_header(params, realm=''):
    """Serialize as a header for an HTTPAuth request."""
    oauth_params = ((k, v) for k, v in params.items() if k.startswith('oauth_'))
    stringy_params = ((k, escape(str(v))) for k, v in oauth_params)
    header_params = ('%s="%s"' % (k, v) for k, v in stringy_params)
    params_header = ', '.join(header_params)
 
    auth_header = 'OAuth realm="%s"' % realm
    if params_header:
        auth_header = "%s, %s" % (auth_header, params_header)
 
    return {'Authorization': to_unicode(auth_header)}

data = cgi.FieldStorage()
# token_secret = None
# if 'token' in data:
#     token_secret = data['token'].value
request_url = 'http://twitter.com/oauth/request_token'
authorize_url = 'http://twitter.com/oauth/authorize'

parameters = {
    'oauth_consumer_key': 'oDoYpMOnyrn4NGeL26YNCw',
    'oauth_nonce': getNonce(),
    'oauth_signature_method': 'HMAC-SHA1',
    'oauth_timestamp': str(int(time.time())),
    'oauth_version': '1.0',
    'oauth_body_hash': base64.b64encode(sha1('').digest())
}

sig = (
    escape('POST'),
    escape(request_url),
    escape(get_normalized_params(parameters, request_url))
)
base = '&'.join(sig)
parameters['oauth_signature'] = getSignature(base, None)

schema, rest = urllib.splittype(request_url)
if rest.startswith('//'):
    hierpart = '//'
else:
    hierpart = ''
host, rest = urllib.splithost(rest)

realm = schema + ':' + hierpart + host
headers = to_header(parameters, realm)

conn = httplib.HTTPConnection('twitter.com')
conn.request('POST', '/oauth/request_token', '', headers)
response = conn.getresponse()

if (response.status != 200):
    exit()

text = response.read().split('&')
fields = dict(kv.split('=') for kv in text)
if (fields['oauth_callback_confirmed'] != 'true'):
    exit()

token_file = open('temp_tokens/' + fields['oauth_token'], 'w')
token_file.write(fields['oauth_token_secret'])

print 'Status: 303 See Other'
print 'Location: ' + authorize_url + '?oauth_token=' + fields['oauth_token']
print ''
