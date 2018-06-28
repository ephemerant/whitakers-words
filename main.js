// Register global desktop shortcut, which can work without focus.
nw.App.registerGlobalHotKey(new nw.Shortcut({ key: mac ? 'Command+D' : 'Ctrl+D', active: lookupClipboard }));

function lookupClipboard() {
  // get the system clipboard
  var clipboard = nw.Clipboard.get();

  // Read from clipboard
  var text = latinize(clipboard.get('text')).trim();

  // Make API call, with a fallback
  ajaxUntilSuccess([
    {
      url: 'http://archives.nd.edu/cgi-bin/wordz.pl?keyword=' + text.replace(/\s+/g, '+'),
      callback: function (data) { outputTranslation(text, parse(data, /<pre>([\w\W]*?)<\/pre>/g)); },
    },
    {
      url: 'https://latin.ucant.org/cgi-bin/translate.cgi?query=' + text.replace(/\s+/g, '+'),
      callback: function (data) { outputTranslation(text, parse(data, /"message"\: "([\w\W]*)"/g)); }
    }
  ]);
}

// Parse result of API call
function parse(data, r) {
  data = r.exec(data)[1].trim();
  data = data.replace(/(?:\\[rn]|[\r\n])/g, "<br>")
  return data;
}

function outputTranslation(query, translation) {
  document.getElementById('query').innerText = query;
  document.getElementById('translation').innerHTML = translation;
}

// Try different AJAX requests until we get an OK (200) response
function ajaxUntilSuccess(attempts) {
  // Get next attempt
  var attempt = attempts.shift();

  // compatible with IE7+, Firefox, Chrome, Opera, Safari
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    // Success
    if (request.readyState == 4 && request.status == 200)
      attempt.callback(request.responseText);
    // Error
    else if (request.readyState == 4 && request.status)
      if (attempts.length)
        ajaxUntilSuccess(attempts)
  };

  request.open('GET', attempt.url, true);
  request.send();
}