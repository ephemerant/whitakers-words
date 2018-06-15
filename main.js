// Register global desktop shortcut, which can work without focus.
nw.App.registerGlobalHotKey(new nw.Shortcut({key: mac ? 'Command+D' : 'Ctrl+D', active: lookupClipboard}));

function lookupClipboard() {
  // get the system clipboard
  var clipboard = nw.Clipboard.get();

  // Read from clipboard
  var text = latinize(clipboard.get('text')).trim();

  callAjax(
      'https://latin.ucant.org/cgi-bin/translate.cgi?query=' + text.replace(/\s+/g, '+'),
      function(data) { outputTranslation(text, parse(data)); });
}

function parse(data) {
    data = /"message"\: "([\w\W]*)"/g.exec(data)[1].trim();
    data = data.replace(/(?:\\[rn]|[\r\n])/g,"<br>")
    return data;
}

function outputTranslation(query, translation) {
  document.getElementById('query').innerText = query;
  document.getElementById('translation').innerHTML = translation;
}

function callAjax(url, callback) {
  var xmlhttp;
  // compatible with IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      callback(xmlhttp.responseText);
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}