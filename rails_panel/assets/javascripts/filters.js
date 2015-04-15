angular.module('RailsPanel', [])
  .directive('ngHtml', function() {
    return function(scope, element, attrs) {
      scope.$watch(attrs.ngHtml, function(value) {
        element[0].innerHTML = value;
      });
    }
  }).
  filter('editorify', function() {
    return function(filename, line) {
      var mapping = {
        mvim: "mvim://open?url=file://%s&line=%d&column=%d",
        mate: "txmt://open?url=file://%s&line=%d&column=%d",
        subl: "subl://open?url=file://%s&line=%d&column=%d",
        sblm: "sblm:///%s",
        emacs: "emacs://open?url=file://%s&line=%d&column=%d",
        atom: "atom://../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../%s:%d",
        mine: "rubymine://open?url=file://%s&line=%d"}
      var editor = localStorage.getItem("railspanel.editor");
      var editorPrefix = mapping[editor]
      if (editor === 'sblm') {
        var out = sprintf(editorPrefix, filename);
        // remove sblm:///c:/git/Icome/app/views/homes/index.html.erb the second :
        // so become sblm:///c/git/Icome/app/views/homes/index.html.erb
        out = out.slice(0, 9) + out.slice(10, out.len);
      } else {
        var out = sprintf(editorPrefix, filename, line, 1);
      }
      return out;
    }
  }).
  filter('checkDuration', function() {
    return function(input) {
      return input > 1000 ? 'secs' : 'millis';
    }
  }).
  filter('parseConsoleMessageType', function() {
    return function(input) {
      if (input.match(/^\s*(?:[\w\s-]*)\([\d\.]+ms\)/)) {
        return 'db';
      } else if (input.match(/SELECT|COMMIT|BEGIN|UPDATE|DELETE/)) {
        return 'db';
      } else if (input.match(/^Completed/)) {
        return 'starred';
      } else if (input.match(/^Processing by/)) {
        return 'non-starred';
      } else if (input.match(/^\s*Rendered/)) {
        return 'rendered';
      } else if (input.match(/[Ss]trateg(?:y|ies)/)) {
        return 'strategies';
      } else if (input.match(/Parameters:/)) {
        return 'parameters';
      } else {
//        console.log(input + ' :: ' + typeof(input));
      }
      return 'unknown';
    }
  }).
  filter('parseConsoleMessage', function() {
    return function(input) {
//      {
//        "name":"console_logger.message",
//        "payload": {
//          "message":" \u001b[1m\u001b[35mCACHE (0.0ms)\u001b[0m SELECT `groups`.* FROM `groups` WHERE `groups`.`id` = -1 LIMIT 1",
//          "level":"debug",
//          "line":105,
//          "filename":"/home/am/.rvm/gems/ruby-2.1.1/gems/activesupport-3.2.21/lib/active_support/log_subscriber.rb",
//          "method":"debug"
//        },
//        "time":0,
//        "transaction_id":0,
//        "end":0,
//        "duration":0
//      }

//      var message = JSON.parse(input.replace(/(?:\\u\d+b)?\[(\d+)m/g, '☆$1'));
      return input.payload.message ? input.payload.message.replace(/(?:\\u\d+b)?\[(\d+)m/g, '') :'<EMPTY>';
    }
  }).
  filter('normalizePath', function() {
    return function(input) {
      return input.remove(/.*\/app\//);
    }
  }).
  filter('sanitize', function() {
    return function(input) {
      return input.
        replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;');
    }
  }).
  filter('ansi2html', function() {
    return function(input) {
      return ansi2html(input);
    }
});
