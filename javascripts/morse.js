var morse = (function (resultElem) {
  var current = '';
  var codes = {
    '•–':   'A', '–•••': 'B', '–•–•': 'C', '–••':  'D',
		'•':    'E', '••–•': 'F', '––•':  'G', '••••': 'H',
		'••':   'I', '•–––': 'J', '–•–':  'K', '•–••': 'L',
		'––':   'M', '–•':   'N', '–––':  'O', '•––•': 'P',
		'––•–': 'Q', '•–•':  'R', '•••':  'S', '–':    'T',
		'••–':  'U', '•••–': 'V', '•––':  'W', '–••–': 'X',
		'–•––': 'Y', '––••': 'Z'
  };
  return {
  	push: function (c) { current += c; console.log(current); },
  	pop: function () {
  	    if (current !== '') {
		      if (!!codes[current]) {
		        resultElem.innerHTML += codes[current];
		      }
		    current = '';
	    }
	  }
  };
})(document.getElementById('result'));

var sound = (function (ctx) {
  var source = ctx.createBufferSource();
  var processor = ctx.createScriptProcessor(1024,1,1);
  var x = 0;
  var f = 440;
  source.connect(processor);
  processor.onaudioprocess = function (e) {
  	var data = e.outputBuffer.getChannelData(0);
  	for (var i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * f * x++ / ctx.sampleRate);
    }
  };
  return {
	  'play': function () { processor.connect(ctx.destination); },
	  'stop': function () { processor.disconnect(); },
  };
})(new AudioContext());

// initialization
(function (morse, threshold, resultElem, keyrElem, keypElem, sensor) {
  var keyd;
  var keyu;
  var keydownOccured = false;
  var keyupOccured = true;
  var timeout;

  document.body.onkeypress = function (e) {
    if (e.which !== 77 && e.which !== 109) return;

  	clearTimeout(timeout);
  	keydownOccured = true;
  	sound.play();

  	keyrElem.style.display = 'none';
  	keypElem.style.display = 'inline';
  	sensor.style.fill = '#000';

  	if (keyupOccured) {
      keyd = new Date();
      if ((!!keyd && !!keyu) && ((keyd - keyu) > 200)) {
  	     morse.pop();
      }
      keyupOccured = false;
  	}
  };
  document.body.onkeyup = function (e) {
  	sound.stop();
  	keyupOccured = true;

  	keyrElem.style.display = 'inline';
  	keypElem.style.display = 'none';
  	sensor.style.fill = '#ddd';

  	keyu = new Date();
  	// only accepting 'm'
  	switch (e.which) {
  	case 77:
    case 109:
  	    if (((keyu - keyd) < threshold)) {
          morse.push('•');
        } else {
          morse.push('–');
        }
  	    break;
  	case 8:
  	    resultElem.innerHTML = resultElem.innerHTML.substr(0, resultElem.innerHTML.length-1);
  	    break;
  	case 32:
  	    resultElem.innerHTML += ' ';
  	}

  	keydownOccured = false;
  	timeout = setTimeout(function () { if (!keydownOccured) { morse.pop(); } }, 200);
  };
})(morse, 80,
   document.getElementById('result'),
   document.getElementById('keyReleased'),
   document.getElementById('keyPressed'),
   document.getElementById('sensor'));
