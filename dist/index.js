webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var qs = exports.qs = function qs(selector) {
    return document.querySelector(selector);
};

/*
* HTML templating without tears (TM). Takes a template string with data-hook attributes on everything you want available on the object,
* and rehydrates it. After you call super() anything with a data-hook is available for function calls, etc.
*/

var Hookable = exports.Hookable = function Hookable(options) {
    var _this = this;

    _classCallCheck(this, Hookable);

    this.parent = options.parent;
    var container = document.createElement('div');
    this.parent.appendChild(container);

    container.innerHTML = options.template;
    var oldContainer = container;
    container = container.children[0];

    this.parent.replaceChild(container, oldContainer);

    [container].concat(_toConsumableArray(Array.prototype.slice.call(container.querySelectorAll('*[data-hook]'), 0))).map(function (el) {
        var hook = el.getAttribute('data-hook');
        _this[hook] = el;
    });
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var Bus = {
	PRELOAD: 0,
	RUNNING: 1,
	PAUSED: 2,
	/* Overall state (see enum above) */
	state: 0,

	/* Events Pub/Sub stuff (for game logic) */
	topics: {},

	// returns a token that can be used to unsubscribe
	sub: function sub(topic, listener) {
		if (!this.topics[topic]) this.topics[topic] = [];
		var new_token = this.token();
		this.topics[topic].push({ func: listener, token: new_token });

		return new_token;
	},

	pub: function pub(topic, data) {
		if (!this.topics[topic] || this.topics[topic].length < 1) return;
		this.topics[topic].forEach(function (listener) {
			listener.func(data);
		});
	},

	token: function token() {
		return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2); // remove `0.`
	},

	unsub: function unsub(topic, token) {
		if (this.topics[topic]) {
			this.topics[topic] = this.topics[topic].filter(function (item) {
				return item.token !== token;
			});
		}
	},

	/* overall delta measurement */
	uptime: 0,

	update: function update(dt) {
		this.uptime += dt;
	},

	getTimestamp: function getTimestamp() {
		/* returns HH:MM:SS timestamp since game began */
		var hours = Math.floor(this.uptime / 36e5),
		    mins = Math.floor(this.uptime % 36e5 / 6e4),
		    secs = Math.floor(this.uptime % 6e4 / 1000);
		return ('0' + hours).slice(-2) + ':' + ('0' + mins).slice(-2) + ':' + ('0' + secs).slice(-2);
	},

	log: function log(content) {
		console.log("[" + this.getTimestamp() + "] " + content.entity + ": " + content.message);
	}
};

Bus.start = function () {
	Bus.state = Bus.RUNNING;
	Bus.busLog("starting game...");
	Bus.pub('game-start');
	Bus.onFrame();
};

var time = new Date().getTime();

Bus.onFrame = function () {
	// get immediate delta
	var now = new Date().getTime(),
	    dt = now - (time || now);
	time = now;

	switch (this.state) {
		case Bus.PRELOAD:
			break;
		case Bus.RUNNING:
			this.pub("update", dt);
			break;
		case Bus.PAUSED:
			break;
	}
	// load next frame
	requestAnimationFrame(this.onFrame);
};

Bus.onFrame = Bus.onFrame.bind(Bus);

Bus.busLog = function (msg) {
	Bus.log({
		entity: "Bus",
		message: msg
	});
};

// subscribe to updates to keep track of delta
Bus.sub("update", function (dt) {
	Bus.update(dt);
});

exports.default = Bus;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

throw new Error("Module build failed: SyntaxError: Unexpected token (25:20)\n\n  23 |     });\n  24 |     \n> 25 |                     <div class='flavour' data-hook='flavour'></div>\n     |                     ^\n  26 |                     <div class='choices-inner' data-hook='choicelist'></div>\n  27 |   }\n  28 |   \n");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(4);

var _helpers = __webpack_require__(0);

var _bus = __webpack_require__(1);

var _bus2 = _interopRequireDefault(_bus);

var _player = __webpack_require__(9);

var _player2 = _interopRequireDefault(_player);

var _bar = __webpack_require__(10);

var _eventList = __webpack_require__(11);

var _dialogue = __webpack_require__(13);

var _cards = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var h = new _bar.Bar({ parent: (0, _helpers.qs)('.status-wrappers'), name: "health" });
var k = new _bar.Bar({ parent: (0, _helpers.qs)('.status-wrappers'), name: "mana" });
var e = new _bar.Bar({ parent: (0, _helpers.qs)('.status-wrappers'), name: "experience" });

var s = new _eventList.EventList({ parent: (0, _helpers.qs)('.game') });
var d = new _dialogue.Dialogue({ parent: (0, _helpers.qs)('.game') });

(0, _helpers.qs)('.player-image').addEventListener('click', function () {
  if (!(s.peek().card instanceof _cards.CharacterSheet)) {
    s.unshift(new _cards.CharacterSheet());
    d.hydrate(s.peek());
  }
});

for (var i = 0; i < 5; i++) {
  s.add();
}

d.setStack(s);
d.hydrate(s.peek());

_bus2.default.sub('exp-amount', function (amount) {
  e.setText(amount + ' EXP');
  e.setPercentage(100 * _player2.default.exp / _player2.default.next_level);
});

_bus2.default.sub('health-amount', function (amount) {
  h.setText(_player2.default.health + '/' + _player2.default.max_health + ' HP');
  h.setPercentage(100 * _player2.default.health / _player2.default.max_health);
});

_bus2.default.sub('mana-amount', function (amount) {
  k.setText(_player2.default.mana + '/' + _player2.default.max_mana + ' MP');
  k.setPercentage(100 * _player2.default.mana / _player2.default.max_mana);
});

_bus2.default.pub('exp-amount', 0);
_bus2.default.pub('health-amount', 0);
_bus2.default.pub('mana-amount', 0);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(5);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(7)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js?sourceMap=true!../../node_modules/sass-loader/lib/loader.js!./style.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js?sourceMap=true!../../node_modules/sass-loader/lib/loader.js!./style.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(true);
// imports


// module
exports.push([module.i, ".game {\n  width: 50%; }\n\n.header {\n  width: 100%;\n  display: grid;\n  grid-template-columns: 100px 1fr; }\n\n.player-image {\n  height: 100px;\n  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iaGVpZ2h0OiA1MTJweDsgd2lkdGg6IDUxMnB4OyI+PHBhdGggZD0iTTAgMGg1MTJ2NTEySDB6IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjEiPjwvcGF0aD48ZyBjbGFzcz0iIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIiBzdHlsZT0idG91Y2gtYWN0aW9uOiBub25lOyI+PHBhdGggZD0iTTI1MC44ODIgMjIuODAyYy0yMy4zNjYgMy4wMzUtNDQuNTUzIDMwLjQ0NC00NC41NTMgNjUuOTM1IDAgMTkuNTU4IDYuNzcxIDM2Ljg1NiAxNi42OTUgNDguODE1bDExLjg0IDE0LjI2My0xOC4yMTcgMy40MjRjLTEyLjkgMi40MjUtMjIuMzU4IDkuMjQtMzAuNDQzIDIwLjMzNi04LjA4NSAxMS4wOTctMTQuMjY2IDI2LjU1OC0xOC41OTggNDQuMzc1LTcuODQzIDMyLjI4LTkuNTY4IDcxLjY5My05Ljg0MiAxMDYuNDM2aDQyLjg2OGwxMS43NzEgMTU3LjgzNmMyOS44OTQgNi43NDggNjEuODExIDYuNTEgOTAuNjAyLjAyNWwxMC40MTQtMTU3Ljg2aDQwLjgxNmMtLjAyNy0zNS4xNjktLjQ3Ny03NS4xMjYtNy41ODQtMTA3LjY1LTMuOTE4LTE3LjkzNC05Ljg1OC0zMy4zNzItMTguMDQtNDQuMzQzLTguMTg1LTEwLjk3LTE4LjA4LTE3Ljc0NS0zMi41NjMtMTkuOTg5bC0xOC41OTItMi44OCAxMS43MzYtMTQuNzA0YzkuNDk1LTExLjg5NyAxNS45MzItMjguOTk3IDE1LjkzMi00OC4wODIgMC0zNy44MzgtMjMuNjU1LTY1Ljg0NC00OS4zOTktNjUuODQ0eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIxIj48L3BhdGg+PC9nPjwvc3ZnPg==);\n  cursor: pointer; }\n\n.bar-outer {\n  height: 18px;\n  width: 100%;\n  position: relative;\n  margin-bottom: 2px; }\n  .bar-outer .progress-shadow {\n    background: #eee;\n    height: 100%;\n    position: absolute;\n    z-index: -1;\n    transition: width 500ms ease-in-out;\n    width: 100%; }\n  .bar-outer .progress {\n    height: 100%;\n    position: absolute;\n    transition: width 500ms ease-in-out;\n    z-index: -1; }\n  .bar-outer .readout {\n    font-weight: bold;\n    color: #fff;\n    font-size: 12px;\n    line-height: 1.5;\n    padding-left: 5px;\n    font-family: sans-serif;\n    z-index: 1; }\n  .bar-outer.health .readout {\n    text-shadow: 1px 1px #a00; }\n  .bar-outer.health .progress {\n    background: #d00; }\n  .bar-outer.mana .readout {\n    text-shadow: 1px 1px #00a; }\n  .bar-outer.mana .progress {\n    background: #00d; }\n  .bar-outer.experience .readout {\n    text-shadow: 1px 1px #aaa; }\n  .bar-outer.experience .progress {\n    background: #ddd; }\n\n.big-card {\n  display: grid;\n  margin-top: 10px;\n  grid-template-columns: 256px 1fr;\n  width: 100%;\n  height: 256px; }\n  .big-card .card-image {\n    border: 1px solid #333; }\n  .big-card .card-image-inner {\n    transition: background-image 0.5s ease-in-out;\n    width: 100%;\n    height: 100%; }\n  .big-card .content {\n    border: 1px solid #333; }\n  .big-card .choices-inner {\n    display: grid;\n    grid-row-gap: 5px;\n    padding: 5px; }\n    .big-card .choices-inner .choice-button {\n      cursor: pointer;\n      background: #fff;\n      border: 1px solid #333; }\n      .big-card .choices-inner .choice-button:hover {\n        color: #fff;\n        background: #000; }\n  .big-card .flavour {\n    background: #eee;\n    width: 100%;\n    height: 80px;\n    font-style: italic;\n    box-sizing: border-box;\n    padding: 10px 10px;\n    text-align: center; }\n\n.monster-card {\n  background-image: url('data:image/svg+xml;charset=utf-8,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%20512%20512\"%20style%3D\"height%3A%20512px%3B%20width%3A%20512px%3B\"><path%20d%3D\"M0%200h512v512H0z\"%20fill%3D\"%23000\"%20fill-opacity%3D\"1\"><%2Fpath><g%20class%3D\"\"%20transform%3D\"translate(0%2C0)\"%20style%3D\"touch-action%3A%20none%3B\"><path%20d%3D\"M129.4%2018c7.4%208.62%2016.4%2016.58%2026.4%2024.01%2013.5%2010.05%2028.8%2019.1%2044.5%2027.03%203.9-4.94%208.3-9.51%2013-13.65-16.7-8.16-33-17.56-46.8-27.81-4.2-3.12-8.1-6.33-11.8-9.58zm273.7%209.98c-21%206.85-33.9%2018.97-49%2032.28%204.3%204.25%208.2%208.88%2011.6%2013.82%2014.6-12.72%2022.4-23.95%2043.2-29.07%2020.8-5.12%2057.9-5.49%2085.1-2.69V24.24c-31.8-4.27-69.9-3.11-90.9%203.74zm-122%2019.91c-47.3%200-85.4%2038.34-85.4%2085.91%200%2047.6%2038.1%2086%2085.4%2086%204.9%200%209.7-.4%2014.3-1.2-1.5-27.7-11.8-55.9-32.5-82%203.3-5.4%206.4-11%209.4-16.6%203.6%206%209.3%209.6%2015.4%209.6%2010.6%200%2019.1-10.3%2019.1-23.1%200-12.42-8.1-22.6-18.4-23.03%204.2-11.79%207.2-23.32%208.7-34.07-5.2-.99-10.5-1.51-16-1.51zm18.2%201.95c15.4%2025.92%2035.4%2061.16%2035.6%2087.76.2%2027.3-19.9%2056.6-35.8%2080.3%2038.6-8.3%2067.5-42.7%2067.5-84.1%200-41.28-28.8-75.6-67.3-83.96zm-153.6%2032.8c-38.9.65-84.13%2027.26-121.15%2052.96-2.22%201.5-4.4%203.1-6.55%204.6v22.2c5.33-4%2010.94-8%2016.81-12.1%2035.95-24.9%2080.89-49.2%20111.09-49.7%207.7-.1%2021.3%205.6%2033.7%2012.7%201.3-6.2%203.1-12.2%205.4-17.93-12.4-7.09-26-12.95-39.3-12.73zM494%20124c-12%2016.9-26.2%2031.3-40.1%2035.2-25.3%207.3-48.9%208.9-72.8%201.3-1.4%205.6-3.4%2011-5.7%2016.2%2027.8%208.9%2055.5%207.9%2083.5-.1%2013.7-3.9%2025.2-12.7%2035.1-23.5zm-310.7%2043.9c-7.6%203.4-16.2%206.4-25.2%209.2-31.4%209.5-68.73%2016-93.95%2038.8-13.13%2011.9-17.8%2029.7-20.67%2048-2.88%2018.4-3.79%2037.9-6.63%2054.2-3.93%2013.7-6.99%2030.1-18.85%2036.2v19c5.15-1.3%209.75-3.5%2013.81-6.4%2014.29-10.4%2019.64-27.8%2022.78-45.7%203.13-18%204.02-37.6%206.67-54.5%202.65-16.9%207.22-30.4%2014.97-37.4%2019.59-17.8%2054.37-25%2087.07-35%209.5-2.9%2018.7-6%2027.4-10-2.9-5.2-5.4-10.7-7.4-16.4zm179.5%2029.7c-3.7%204.8-7.9%209.3-12.4%2013.4%207.5%204.9%2015.6%2010.3%2023.7%2016.2%2033.8%2024.5%2068.4%2057.7%2074.5%2084.6%201.6%206.9-.1%2013.8-4.3%2021.8-4.3%208.1-11%2016.8-18%2025.8-6.9%208.9-14.1%2018.2-19%2028.4-4.8%2010.3-7.2%2022.3-2.9%2034.1v.1c4.6%2012.6%2014.8%2022.2%2026.7%2030.1%2011.8%207.9%2025.7%2014.3%2039%2019.3%208.4%203.2%2016.6%205.9%2023.9%208v-18.8c-5.5-1.7-11.5-3.7-17.5-6-12.5-4.8-25.3-10.7-35.4-17.5-10.1-6.7-17.2-14.3-19.7-21.2v-.1c-2.4-6.5-1.4-12.6%202.2-20.3%203.6-7.7%2010-16.2%2016.9-25.1%206.9-8.9%2014.3-18.2%2019.7-28.4%205.4-10.2%208.8-21.9%206-34.2-8.4-36.9-46.4-69.7-81.6-95.2-7.5-5.4-14.8-10.4-21.8-15zM215%20213.7c-29%2022.9-44.6%2047.9-50.6%2073.8-6.8%2029.4-1.2%2058.9%209%2086.8-38.7%2018.4-76.93%2031.1-102.75%2055.2-10.36%2010.1-11.68%2025-9.54%2039.4%201.22%208.2%203.58%2016.7%206.56%2025.1h19.21c-3.78-9.7-6.72-19.3-7.96-27.7-1.73-11.7-.1-19.6%204.27-23.8%2030.41-22.2%2067.51-39.6%2096.81-51.4%2012.6%2031.9%2031.9%2061.9%2044.2%2090.9%201.8%204.2%203.3%208.2%204.5%2012h18.9c-1.7-6.2-4-12.5-6.7-18.9-13.9-33.5-32.3-63.1-44.7-91.9%2031.4-15.9%2061.3-35.4%2078.2-65%2012.3-21.5%2013.7-52.6%2012.9-80.6-6.1.3-12.5.2-18.1-.5.8%2027.1-1.8%2057.1-10.4%2072.1-13.9%2024.1-39.9%2042-69.2%2057.1-8.9-25.3-13.2-50.6-7.7-74.7%205.3-22.8%2019.3-45.5%2048.5-67.2-5.5-3.1-10.6-6.7-15.4-10.7zm118.5%209.8c-5.3%203.1-10.9%205.8-16.8%207.9%201.9%202.4%203.9%204.9%205.8%207.5%2013.5%2018%2025.3%2040.7%2024.3%2053.3-.4%206.3-3.6%2011.7-9.2%2017.6-5.6%205.8-13.6%2011.6-22%2017.6-8.3%206-17%2012.2-24%2020-7%207.7-12.5%2017.5-12.5%2029.2.1%2011.8%205.3%2021.8%2012.1%2029.8%206.9%208%2015.5%2014.4%2023.9%2020.6%2016.7%2012.4%2031.8%2023.8%2034.9%2037.3%201.6%207%20.6%2018-1.9%2029.7h18.8c2.3-11.6%203.1-23.2.7-33.7-5.2-22.6-25.4-35.6-41.8-47.7-8.3-6.1-15.8-12-20.9-18-5.1-5.9-7.8-11.3-7.8-18%200-6.3%202.6-11.4%207.8-17.1%205.2-5.8%2013-11.5%2021.3-17.5%208.2-5.9%2017-12.1%2024.3-19.7%207.4-7.6%2013.4-17.1%2014.3-28.7%201.7-22.9-13.5-46.3-27.8-65.5-1.2-1.6-2.4-3.1-3.5-4.6z\"%20fill%3D\"%23fff\"%20fill-opacity%3D\"1\"><%2Fpath><%2Fg><%2Fsvg>'); }\n\n.money-card {\n  background-image: url('data:image/svg+xml;charset=utf-8,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%20512%20512\"%20style%3D\"height%3A%20512px%3B%20width%3A%20512px%3B\"><path%20d%3D\"M0%200h512v512H0z\"%20fill%3D\"%23000\"%20fill-opacity%3D\"1\"><%2Fpath><g%20class%3D\"\"%20transform%3D\"translate(0%2C0)\"%20style%3D\"touch-action%3A%20none%3B\"><path%20d%3D\"M136%2025c-16.457%200-31.287%203.45-41.23%208.422C84.826%2038.394%2081%2044.027%2081%2048c0%203.973%203.826%209.606%2013.77%2014.578C104.713%2067.55%20119.543%2071%20136%2071c16.457%200%2031.287-3.45%2041.23-8.422C187.174%2057.606%20191%2051.973%20191%2048c0-3.973-3.826-9.606-13.77-14.578C167.287%2028.45%20152.457%2025%20136%2025zm160%2032c-16.457%200-31.287%203.45-41.23%208.422C244.826%2070.394%20241%2076.027%20241%2080c0%203.973%203.826%209.606%2013.77%2014.578C264.713%2099.55%20279.543%20103%20296%20103c4.55%200%208.967-.27%2013.2-.758%204.32-5.534%2010.53-10.092%2017.52-13.588%207.064-3.53%2015.262-6.227%2024.24-7.98.025-.23.04-.455.04-.674%200-3.973-3.826-9.606-13.77-14.578C327.287%2060.45%20312.457%2057%20296%2057zM81%2075.445V80c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87C189.716%2085.574%20191%2082.515%20191%2080v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C172.06%2085.288%20154.89%2089%20136%2089s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zM376%2096.33c-16.457%200-31.287%203.452-41.23%208.424-9.944%204.972-13.77%2010.603-13.77%2014.576%200%203.973%203.826%209.606%2013.77%2014.578%209.943%204.972%2024.773%208.422%2041.23%208.422%2016.457%200%2031.287-3.45%2041.23-8.422%209.944-4.972%2013.77-10.605%2013.77-14.578%200-3.973-3.826-9.604-13.77-14.576-9.943-4.972-24.773-8.424-41.23-8.424zm-135%2011.115v2.313c2.9%201.073%205.67%202.26%208.28%203.564%209.037%204.52%2016.8%2010.794%2020.81%2018.69%2010.174%202.46%2021.72%203.366%2032.91%202.718v-13.917c-2.305.116-4.636.187-7%20.187-18.89%200-36.06-3.712-49.28-10.322-1.98-.99-3.888-2.075-5.72-3.233zm-160%20.024V112c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.83%201.972%2014.433%203.186%2022.216%203.654%201.988-5.227%205.6-9.806%2010.19-13.712-12.785.277-25.663-1.26-37.4-4.65-7.796-2.25-14.69-5.2-20.503-8.89zM200%20121c-16.457%200-31.287%203.45-41.23%208.422C148.826%20134.394%20145%20140.027%20145%20144c0%203.973%203.826%209.606%2013.77%2014.578C168.713%20163.55%20183.543%20167%20200%20167c16.457%200%2031.287-3.45%2041.23-8.422C251.174%20153.606%20255%20147.973%20255%20144c0-3.973-3.826-9.606-13.77-14.578C231.287%20124.45%20216.457%20121%20200%20121zM81%20139.47V144c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.328%201.826%2013.32%202.993%2020.503%203.53V152.75c-8.772-.594-17.406-2.057-25.496-4.393-7.797-2.25-14.69-5.203-20.504-8.89zm240%207.305v4.555c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233-13.22%206.61-30.39%2010.322-49.28%2010.322s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm-48%204.246v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zm-128%2020.425V176c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C236.06%20181.288%20218.89%20185%20200%20185s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm-64%20.024V176c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.328%201.826%2013.32%202.993%2020.503%203.53V184.75c-8.772-.594-17.406-2.057-25.496-4.393-7.797-2.25-14.69-5.203-20.504-8.89zm240%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.688-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.202-20.504-8.89zm-48%204.22v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zM81%20203.47V208c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.328%201.826%2013.32%202.993%2020.503%203.53V216.75c-8.772-.594-17.406-2.057-25.496-4.393-7.797-2.25-14.69-5.203-20.504-8.89zm64%200V208c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm176%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.688-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.202-20.504-8.89zm-48%204.22v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zm-128%2020.45v2.288c2.9%201.073%205.67%202.26%208.28%203.564%209.038%204.52%2016.802%2010.795%2020.812%2018.692%2017.338%204.196%2038.678%203.883%2055.412-.948%208.954-2.585%2015.845-6.245%2020.03-9.87%204.183-3.622%205.466-6.68%205.466-9.196v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm176%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.688-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.202-20.504-8.89zm-48%204.22v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zM104%20249c-16.457%200-31.287%203.45-41.23%208.422C52.826%20262.394%2049%20268.027%2049%20272c0%203.973%203.826%209.606%2013.77%2014.578C72.713%20291.55%2087.543%20295%20104%20295c16.457%200%2031.287-3.45%2041.23-8.422C155.174%20281.606%20159%20275.973%20159%20272c0-3.973-3.826-9.606-13.77-14.578C135.287%20252.45%20120.457%20249%20104%20249zm151%2018.47c-5.813%203.687-12.707%206.64-20.504%208.89-17.97%205.187-38.608%206.05-57.496%202.642v13.664c16.775%203.494%2036.694%202.964%2052.504-1.6%208.954-2.585%2015.845-6.245%2020.03-9.87%204.183-3.622%205.466-6.68%205.466-9.196v-4.53zm66%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.045%203.503%2010.64%207.03%2019.162%209.598%203.74-3.428%208.228-6.37%2013.09-8.803%201.152-.575%202.344-1.12%203.553-1.652-7.14-.744-14.137-2.066-20.77-3.98-7.796-2.25-14.69-5.202-20.503-8.89zm110%200c-2.84%201.8-5.938%203.422-9.27%204.876%203.1.31%206.13.734%209.082%201.252.12-.553.188-1.09.188-1.598v-4.53zm-158%204.22v13.62c6.997%201.482%2014.783%202.36%2023%202.36%202.374%200%204.705-.087%207-.227v-13.92c-10.064.53-20.263-.082-30-1.832zM408%20297c-16.457%200-31.287%203.45-41.23%208.422C356.826%20310.394%20353%20316.027%20353%20320c0%203.973%203.826%209.606%2013.77%2014.578C376.713%20339.55%20391.543%20343%20408%20343c16.457%200%2031.287-3.45%2041.23-8.422C459.174%20329.606%20463%20323.973%20463%20320c0-3.973-3.826-9.606-13.77-14.578C439.287%20300.45%20424.457%20297%20408%20297zm-359%202.445V304c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C140.06%20309.288%20122.89%20313%20104%20313s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm206%20.024c-5.813%203.687-12.707%206.64-20.504%208.89-17.97%205.187-38.608%206.05-57.496%202.642v13.664c16.775%203.494%2036.694%202.964%2052.504-1.6%208.954-2.585%2015.845-6.245%2020.03-9.87%204.183-3.622%205.466-6.68%205.466-9.196v-4.53zm66%207.33v4.53c0%203.973%203.826%209.606%2013.77%2014.578.074.037.155.073.23.11V313.56c-5.168-1.89-9.862-4.135-14-6.76zM49%20331.47V336c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zM177%20343v13.648c4.885%201.032%2010.16%201.767%2015.697%202.114%201.985-5.246%205.602-9.84%2010.207-13.756-8.726.19-17.487-.487-25.904-2.006zM264%20345c-16.457%200-31.287%203.45-41.23%208.422C212.826%20358.394%20209%20364.027%20209%20368c0%203.973%203.826%209.606%2013.77%2014.578C232.713%20387.55%20247.543%20391%20264%20391c16.457%200%2031.287-3.45%2041.23-8.422C315.174%20377.606%20319%20371.973%20319%20368c0-3.973-3.826-9.606-13.77-14.578C295.287%20348.45%20280.457%20345%20264%20345zm89%202.445V352c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C444.06%20357.288%20426.89%20361%20408%20361s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zM49%20363.47V368c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm304%2016V384c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm-144%2015.975V400c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C300.06%20405.288%20282.89%20409%20264%20409s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm-160%20.024V400c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm304%2016V416c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm-304%2016V432c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm160%200V432c0%203.973%203.826%209.606%2013.77%2014.578C232.713%20451.55%20247.543%20455%20264%20455c16.457%200%2031.287-3.45%2041.23-8.422C315.174%20441.606%20319%20435.973%20319%20432v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm144%2016V448c0%203.973%203.826%209.606%2013.77%2014.578C376.713%20467.55%20391.543%20471%20408%20471c16.457%200%2031.287-3.45%2041.23-8.422C459.174%20457.606%20463%20451.973%20463%20448v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm-304%2016V464c0%203.973%203.826%209.606%2013.77%2014.578C72.713%20483.55%2087.543%20487%20104%20487c16.457%200%2031.287-3.45%2041.23-8.422C155.174%20473.606%20159%20467.973%20159%20464v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89z\"%20fill%3D\"%23fff\"%20fill-opacity%3D\"1\"><%2Fpath><%2Fg><%2Fsvg>'); }\n\n.directions-card {\n  background-image: url('data:image/svg+xml;charset=utf-8,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%20512%20512\"%20style%3D\"height%3A%20512px%3B%20width%3A%20512px%3B\"><path%20d%3D\"M0%200h512v512H0z\"%20fill%3D\"%23000\"%20fill-opacity%3D\"1\"><%2Fpath><g%20class%3D\"\"%20transform%3D\"translate(0%2C0)\"%20style%3D\"touch-action%3A%20none%3B\"><path%20d%3D\"M277.3%2035.11l-32.1%202.12-1%2032.93%2033.6.05-.5-35.1zM151.7%2088.04L67.96%20118.9%20152%20169.2l188-6.2%202.4-74.72-190.7-.24zM279.2%20183l-38.3%201.3-.8%2027.8%2039.5%201.2-.4-30.3zm-93.1%2045.6l.8%2064.2%20200.4.9%2051.7-29.2-55.8-30.2-197.1-5.7zm51.1%2082.5l-5%20175.3%2050.9.6-2.3-175.7-43.6-.2z\"%20fill%3D\"%23fff\"%20fill-opacity%3D\"1\"><%2Fpath><%2Fg><%2Fsvg>'); }\n\n.event-list {\n  margin-top: 50px;\n  margin-bottom: 23px;\n  display: block;\n  height: 0px;\n  border: 2px solid #333;\n  border-radius: 5px;\n  list-style: none;\n  position: relative; }\n  .event-list::after {\n    content: '';\n    display: block;\n    position: absolute;\n    top: -25px;\n    left: 56px;\n    z-index: -1;\n    width: 4px;\n    height: 50px;\n    background: #333; }\n  .event-list li {\n    width: 34px;\n    display: block;\n    position: absolute;\n    top: -17px;\n    transition: transform 750ms ease-in-out; }\n    .event-list li .inner {\n      border: 1px solid #aaa; }\n    .event-list li div {\n      width: 34px;\n      height: 34px;\n      box-sizing: border-box;\n      text-align: center;\n      background-color: #fff; }\n\n.downbounce {\n  animation-name: bounce;\n  animation-duration: 750ms;\n  animation-timing-function: ease-in-out; }\n\n.upbounce {\n  animation-name: bounce2;\n  animation-duration: 750ms;\n  animation-timing-function: ease-in-out; }\n\n.spin1 {\n  animation-name: spin;\n  animation-duration: 500ms;\n  animation-timing-function: ease-in-out; }\n\n.grow1 {\n  animation-name: grow;\n  animation-duration: 500ms;\n  animation-timing-function: ease-in-out; }\n\n@keyframes spin {\n  0% {\n    transform: rotateZ(-90deg);\n    opacity: 0; }\n  100% {\n    transform: rotateZ(0deg);\n    opacity: 1; } }\n\n@keyframes bounce {\n  0% {\n    transform: translateY(0px); }\n  50% {\n    transform: translateY(48px); }\n  100% {\n    transform: translateY(0px); } }\n\n@keyframes bounce2 {\n  0% {\n    transform: translateY(0px); }\n  50% {\n    transform: translateY(-48px); }\n  100% {\n    transform: translateY(0px); } }\n\n@keyframes grow {\n  0% {\n    width: 34px;\n    height: 34px;\n    transform: translateX(0px) translateY(0px); }\n  100% {\n    width: 258px;\n    height: 256px;\n    transform: translateX(-42px) translateY(-340px); } }\n", "", {"version":3,"sources":["/app/src/scss/style.scss"],"names":[],"mappings":"AAAA;EACE,WAAW,EAAE;;AAEf;EACE,YAAY;EACZ,cAAc;EACd,iCAAiC,EAAE;;AAErC;EACE,cAAc;EACd,8nCAA8nC;EAC9nC,gBAAgB,EAAE;;AAEpB;EACE,aAAa;EACb,YAAY;EACZ,mBAAmB;EACnB,mBAAmB,EAAE;EACrB;IACE,iBAAiB;IACjB,aAAa;IACb,mBAAmB;IACnB,YAAY;IACZ,oCAAoC;IACpC,YAAY,EAAE;EAChB;IACE,aAAa;IACb,mBAAmB;IACnB,oCAAoC;IACpC,YAAY,EAAE;EAChB;IACE,kBAAkB;IAClB,YAAY;IACZ,gBAAgB;IAChB,iBAAiB;IACjB,kBAAkB;IAClB,wBAAwB;IACxB,WAAW,EAAE;EACf;IACE,0BAA0B,EAAE;EAC9B;IACE,iBAAiB,EAAE;EACrB;IACE,0BAA0B,EAAE;EAC9B;IACE,iBAAiB,EAAE;EACrB;IACE,0BAA0B,EAAE;EAC9B;IACE,iBAAiB,EAAE;;AAEvB;EACE,cAAc;EACd,iBAAiB;EACjB,iCAAiC;EACjC,YAAY;EACZ,cAAc,EAAE;EAChB;IACE,uBAAuB,EAAE;EAC3B;IACE,8CAA8C;IAC9C,YAAY;IACZ,aAAa,EAAE;EACjB;IACE,uBAAuB,EAAE;EAC3B;IACE,cAAc;IACd,kBAAkB;IAClB,aAAa,EAAE;IACf;MACE,gBAAgB;MAChB,iBAAiB;MACjB,uBAAuB,EAAE;MACzB;QACE,YAAY;QACZ,iBAAiB,EAAE;EACzB;IACE,iBAAiB;IACjB,YAAY;IACZ,aAAa;IACb,mBAAmB;IACnB,uBAAuB;IACvB,mBAAmB;IACnB,mBAAmB,EAAE;;AAEzB;EACE,+mIAA+mI,EAAE;;AAEnnI;EACE,8sZAA8sZ,EAAE;;AAEltZ;EACE,0uBAA0uB,EAAE;;AAE9uB;EACE,iBAAiB;EACjB,oBAAoB;EACpB,eAAe;EACf,YAAY;EACZ,uBAAuB;EACvB,mBAAmB;EACnB,iBAAiB;EACjB,mBAAmB,EAAE;EACrB;IACE,YAAY;IACZ,eAAe;IACf,mBAAmB;IACnB,WAAW;IACX,WAAW;IACX,YAAY;IACZ,WAAW;IACX,aAAa;IACb,iBAAiB,EAAE;EACrB;IACE,YAAY;IACZ,eAAe;IACf,mBAAmB;IACnB,WAAW;IACX,wCAAwC,EAAE;IAC1C;MACE,uBAAuB,EAAE;IAC3B;MACE,YAAY;MACZ,aAAa;MACb,uBAAuB;MACvB,mBAAmB;MACnB,uBAAuB,EAAE;;AAE/B;EACE,uBAAuB;EACvB,0BAA0B;EAC1B,uCAAuC,EAAE;;AAE3C;EACE,wBAAwB;EACxB,0BAA0B;EAC1B,uCAAuC,EAAE;;AAE3C;EACE,qBAAqB;EACrB,0BAA0B;EAC1B,uCAAuC,EAAE;;AAE3C;EACE,qBAAqB;EACrB,0BAA0B;EAC1B,uCAAuC,EAAE;;AAE3C;EACE;IACE,2BAA2B;IAC3B,WAAW,EAAE;EACf;IACE,yBAAyB;IACzB,WAAW,EAAE,EAAE;;AAEnB;EACE;IACE,2BAA2B,EAAE;EAC/B;IACE,4BAA4B,EAAE;EAChC;IACE,2BAA2B,EAAE,EAAE;;AAEnC;EACE;IACE,2BAA2B,EAAE;EAC/B;IACE,6BAA6B,EAAE;EACjC;IACE,2BAA2B,EAAE,EAAE;;AAEnC;EACE;IACE,YAAY;IACZ,aAAa;IACb,2CAA2C,EAAE;EAC/C;IACE,aAAa;IACb,cAAc;IACd,gDAAgD,EAAE,EAAE","file":"style.scss","sourcesContent":[".game {\n  width: 50%; }\n\n.header {\n  width: 100%;\n  display: grid;\n  grid-template-columns: 100px 1fr; }\n\n.player-image {\n  height: 100px;\n  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iaGVpZ2h0OiA1MTJweDsgd2lkdGg6IDUxMnB4OyI+PHBhdGggZD0iTTAgMGg1MTJ2NTEySDB6IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjEiPjwvcGF0aD48ZyBjbGFzcz0iIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIiBzdHlsZT0idG91Y2gtYWN0aW9uOiBub25lOyI+PHBhdGggZD0iTTI1MC44ODIgMjIuODAyYy0yMy4zNjYgMy4wMzUtNDQuNTUzIDMwLjQ0NC00NC41NTMgNjUuOTM1IDAgMTkuNTU4IDYuNzcxIDM2Ljg1NiAxNi42OTUgNDguODE1bDExLjg0IDE0LjI2My0xOC4yMTcgMy40MjRjLTEyLjkgMi40MjUtMjIuMzU4IDkuMjQtMzAuNDQzIDIwLjMzNi04LjA4NSAxMS4wOTctMTQuMjY2IDI2LjU1OC0xOC41OTggNDQuMzc1LTcuODQzIDMyLjI4LTkuNTY4IDcxLjY5My05Ljg0MiAxMDYuNDM2aDQyLjg2OGwxMS43NzEgMTU3LjgzNmMyOS44OTQgNi43NDggNjEuODExIDYuNTEgOTAuNjAyLjAyNWwxMC40MTQtMTU3Ljg2aDQwLjgxNmMtLjAyNy0zNS4xNjktLjQ3Ny03NS4xMjYtNy41ODQtMTA3LjY1LTMuOTE4LTE3LjkzNC05Ljg1OC0zMy4zNzItMTguMDQtNDQuMzQzLTguMTg1LTEwLjk3LTE4LjA4LTE3Ljc0NS0zMi41NjMtMTkuOTg5bC0xOC41OTItMi44OCAxMS43MzYtMTQuNzA0YzkuNDk1LTExLjg5NyAxNS45MzItMjguOTk3IDE1LjkzMi00OC4wODIgMC0zNy44MzgtMjMuNjU1LTY1Ljg0NC00OS4zOTktNjUuODQ0eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIxIj48L3BhdGg+PC9nPjwvc3ZnPg==);\n  cursor: pointer; }\n\n.bar-outer {\n  height: 18px;\n  width: 100%;\n  position: relative;\n  margin-bottom: 2px; }\n  .bar-outer .progress-shadow {\n    background: #eee;\n    height: 100%;\n    position: absolute;\n    z-index: -1;\n    transition: width 500ms ease-in-out;\n    width: 100%; }\n  .bar-outer .progress {\n    height: 100%;\n    position: absolute;\n    transition: width 500ms ease-in-out;\n    z-index: -1; }\n  .bar-outer .readout {\n    font-weight: bold;\n    color: #fff;\n    font-size: 12px;\n    line-height: 1.5;\n    padding-left: 5px;\n    font-family: sans-serif;\n    z-index: 1; }\n  .bar-outer.health .readout {\n    text-shadow: 1px 1px #a00; }\n  .bar-outer.health .progress {\n    background: #d00; }\n  .bar-outer.mana .readout {\n    text-shadow: 1px 1px #00a; }\n  .bar-outer.mana .progress {\n    background: #00d; }\n  .bar-outer.experience .readout {\n    text-shadow: 1px 1px #aaa; }\n  .bar-outer.experience .progress {\n    background: #ddd; }\n\n.big-card {\n  display: grid;\n  margin-top: 10px;\n  grid-template-columns: 256px 1fr;\n  width: 100%;\n  height: 256px; }\n  .big-card .card-image {\n    border: 1px solid #333; }\n  .big-card .card-image-inner {\n    transition: background-image 0.5s ease-in-out;\n    width: 100%;\n    height: 100%; }\n  .big-card .content {\n    border: 1px solid #333; }\n  .big-card .choices-inner {\n    display: grid;\n    grid-row-gap: 5px;\n    padding: 5px; }\n    .big-card .choices-inner .choice-button {\n      cursor: pointer;\n      background: #fff;\n      border: 1px solid #333; }\n      .big-card .choices-inner .choice-button:hover {\n        color: #fff;\n        background: #000; }\n  .big-card .flavour {\n    background: #eee;\n    width: 100%;\n    height: 80px;\n    font-style: italic;\n    box-sizing: border-box;\n    padding: 10px 10px;\n    text-align: center; }\n\n.monster-card {\n  background-image: url('data:image/svg+xml;charset=utf-8,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%20512%20512\"%20style%3D\"height%3A%20512px%3B%20width%3A%20512px%3B\"><path%20d%3D\"M0%200h512v512H0z\"%20fill%3D\"%23000\"%20fill-opacity%3D\"1\"><%2Fpath><g%20class%3D\"\"%20transform%3D\"translate(0%2C0)\"%20style%3D\"touch-action%3A%20none%3B\"><path%20d%3D\"M129.4%2018c7.4%208.62%2016.4%2016.58%2026.4%2024.01%2013.5%2010.05%2028.8%2019.1%2044.5%2027.03%203.9-4.94%208.3-9.51%2013-13.65-16.7-8.16-33-17.56-46.8-27.81-4.2-3.12-8.1-6.33-11.8-9.58zm273.7%209.98c-21%206.85-33.9%2018.97-49%2032.28%204.3%204.25%208.2%208.88%2011.6%2013.82%2014.6-12.72%2022.4-23.95%2043.2-29.07%2020.8-5.12%2057.9-5.49%2085.1-2.69V24.24c-31.8-4.27-69.9-3.11-90.9%203.74zm-122%2019.91c-47.3%200-85.4%2038.34-85.4%2085.91%200%2047.6%2038.1%2086%2085.4%2086%204.9%200%209.7-.4%2014.3-1.2-1.5-27.7-11.8-55.9-32.5-82%203.3-5.4%206.4-11%209.4-16.6%203.6%206%209.3%209.6%2015.4%209.6%2010.6%200%2019.1-10.3%2019.1-23.1%200-12.42-8.1-22.6-18.4-23.03%204.2-11.79%207.2-23.32%208.7-34.07-5.2-.99-10.5-1.51-16-1.51zm18.2%201.95c15.4%2025.92%2035.4%2061.16%2035.6%2087.76.2%2027.3-19.9%2056.6-35.8%2080.3%2038.6-8.3%2067.5-42.7%2067.5-84.1%200-41.28-28.8-75.6-67.3-83.96zm-153.6%2032.8c-38.9.65-84.13%2027.26-121.15%2052.96-2.22%201.5-4.4%203.1-6.55%204.6v22.2c5.33-4%2010.94-8%2016.81-12.1%2035.95-24.9%2080.89-49.2%20111.09-49.7%207.7-.1%2021.3%205.6%2033.7%2012.7%201.3-6.2%203.1-12.2%205.4-17.93-12.4-7.09-26-12.95-39.3-12.73zM494%20124c-12%2016.9-26.2%2031.3-40.1%2035.2-25.3%207.3-48.9%208.9-72.8%201.3-1.4%205.6-3.4%2011-5.7%2016.2%2027.8%208.9%2055.5%207.9%2083.5-.1%2013.7-3.9%2025.2-12.7%2035.1-23.5zm-310.7%2043.9c-7.6%203.4-16.2%206.4-25.2%209.2-31.4%209.5-68.73%2016-93.95%2038.8-13.13%2011.9-17.8%2029.7-20.67%2048-2.88%2018.4-3.79%2037.9-6.63%2054.2-3.93%2013.7-6.99%2030.1-18.85%2036.2v19c5.15-1.3%209.75-3.5%2013.81-6.4%2014.29-10.4%2019.64-27.8%2022.78-45.7%203.13-18%204.02-37.6%206.67-54.5%202.65-16.9%207.22-30.4%2014.97-37.4%2019.59-17.8%2054.37-25%2087.07-35%209.5-2.9%2018.7-6%2027.4-10-2.9-5.2-5.4-10.7-7.4-16.4zm179.5%2029.7c-3.7%204.8-7.9%209.3-12.4%2013.4%207.5%204.9%2015.6%2010.3%2023.7%2016.2%2033.8%2024.5%2068.4%2057.7%2074.5%2084.6%201.6%206.9-.1%2013.8-4.3%2021.8-4.3%208.1-11%2016.8-18%2025.8-6.9%208.9-14.1%2018.2-19%2028.4-4.8%2010.3-7.2%2022.3-2.9%2034.1v.1c4.6%2012.6%2014.8%2022.2%2026.7%2030.1%2011.8%207.9%2025.7%2014.3%2039%2019.3%208.4%203.2%2016.6%205.9%2023.9%208v-18.8c-5.5-1.7-11.5-3.7-17.5-6-12.5-4.8-25.3-10.7-35.4-17.5-10.1-6.7-17.2-14.3-19.7-21.2v-.1c-2.4-6.5-1.4-12.6%202.2-20.3%203.6-7.7%2010-16.2%2016.9-25.1%206.9-8.9%2014.3-18.2%2019.7-28.4%205.4-10.2%208.8-21.9%206-34.2-8.4-36.9-46.4-69.7-81.6-95.2-7.5-5.4-14.8-10.4-21.8-15zM215%20213.7c-29%2022.9-44.6%2047.9-50.6%2073.8-6.8%2029.4-1.2%2058.9%209%2086.8-38.7%2018.4-76.93%2031.1-102.75%2055.2-10.36%2010.1-11.68%2025-9.54%2039.4%201.22%208.2%203.58%2016.7%206.56%2025.1h19.21c-3.78-9.7-6.72-19.3-7.96-27.7-1.73-11.7-.1-19.6%204.27-23.8%2030.41-22.2%2067.51-39.6%2096.81-51.4%2012.6%2031.9%2031.9%2061.9%2044.2%2090.9%201.8%204.2%203.3%208.2%204.5%2012h18.9c-1.7-6.2-4-12.5-6.7-18.9-13.9-33.5-32.3-63.1-44.7-91.9%2031.4-15.9%2061.3-35.4%2078.2-65%2012.3-21.5%2013.7-52.6%2012.9-80.6-6.1.3-12.5.2-18.1-.5.8%2027.1-1.8%2057.1-10.4%2072.1-13.9%2024.1-39.9%2042-69.2%2057.1-8.9-25.3-13.2-50.6-7.7-74.7%205.3-22.8%2019.3-45.5%2048.5-67.2-5.5-3.1-10.6-6.7-15.4-10.7zm118.5%209.8c-5.3%203.1-10.9%205.8-16.8%207.9%201.9%202.4%203.9%204.9%205.8%207.5%2013.5%2018%2025.3%2040.7%2024.3%2053.3-.4%206.3-3.6%2011.7-9.2%2017.6-5.6%205.8-13.6%2011.6-22%2017.6-8.3%206-17%2012.2-24%2020-7%207.7-12.5%2017.5-12.5%2029.2.1%2011.8%205.3%2021.8%2012.1%2029.8%206.9%208%2015.5%2014.4%2023.9%2020.6%2016.7%2012.4%2031.8%2023.8%2034.9%2037.3%201.6%207%20.6%2018-1.9%2029.7h18.8c2.3-11.6%203.1-23.2.7-33.7-5.2-22.6-25.4-35.6-41.8-47.7-8.3-6.1-15.8-12-20.9-18-5.1-5.9-7.8-11.3-7.8-18%200-6.3%202.6-11.4%207.8-17.1%205.2-5.8%2013-11.5%2021.3-17.5%208.2-5.9%2017-12.1%2024.3-19.7%207.4-7.6%2013.4-17.1%2014.3-28.7%201.7-22.9-13.5-46.3-27.8-65.5-1.2-1.6-2.4-3.1-3.5-4.6z\"%20fill%3D\"%23fff\"%20fill-opacity%3D\"1\"><%2Fpath><%2Fg><%2Fsvg>'); }\n\n.money-card {\n  background-image: url('data:image/svg+xml;charset=utf-8,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%20512%20512\"%20style%3D\"height%3A%20512px%3B%20width%3A%20512px%3B\"><path%20d%3D\"M0%200h512v512H0z\"%20fill%3D\"%23000\"%20fill-opacity%3D\"1\"><%2Fpath><g%20class%3D\"\"%20transform%3D\"translate(0%2C0)\"%20style%3D\"touch-action%3A%20none%3B\"><path%20d%3D\"M136%2025c-16.457%200-31.287%203.45-41.23%208.422C84.826%2038.394%2081%2044.027%2081%2048c0%203.973%203.826%209.606%2013.77%2014.578C104.713%2067.55%20119.543%2071%20136%2071c16.457%200%2031.287-3.45%2041.23-8.422C187.174%2057.606%20191%2051.973%20191%2048c0-3.973-3.826-9.606-13.77-14.578C167.287%2028.45%20152.457%2025%20136%2025zm160%2032c-16.457%200-31.287%203.45-41.23%208.422C244.826%2070.394%20241%2076.027%20241%2080c0%203.973%203.826%209.606%2013.77%2014.578C264.713%2099.55%20279.543%20103%20296%20103c4.55%200%208.967-.27%2013.2-.758%204.32-5.534%2010.53-10.092%2017.52-13.588%207.064-3.53%2015.262-6.227%2024.24-7.98.025-.23.04-.455.04-.674%200-3.973-3.826-9.606-13.77-14.578C327.287%2060.45%20312.457%2057%20296%2057zM81%2075.445V80c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87C189.716%2085.574%20191%2082.515%20191%2080v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C172.06%2085.288%20154.89%2089%20136%2089s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zM376%2096.33c-16.457%200-31.287%203.452-41.23%208.424-9.944%204.972-13.77%2010.603-13.77%2014.576%200%203.973%203.826%209.606%2013.77%2014.578%209.943%204.972%2024.773%208.422%2041.23%208.422%2016.457%200%2031.287-3.45%2041.23-8.422%209.944-4.972%2013.77-10.605%2013.77-14.578%200-3.973-3.826-9.604-13.77-14.576-9.943-4.972-24.773-8.424-41.23-8.424zm-135%2011.115v2.313c2.9%201.073%205.67%202.26%208.28%203.564%209.037%204.52%2016.8%2010.794%2020.81%2018.69%2010.174%202.46%2021.72%203.366%2032.91%202.718v-13.917c-2.305.116-4.636.187-7%20.187-18.89%200-36.06-3.712-49.28-10.322-1.98-.99-3.888-2.075-5.72-3.233zm-160%20.024V112c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.83%201.972%2014.433%203.186%2022.216%203.654%201.988-5.227%205.6-9.806%2010.19-13.712-12.785.277-25.663-1.26-37.4-4.65-7.796-2.25-14.69-5.2-20.503-8.89zM200%20121c-16.457%200-31.287%203.45-41.23%208.422C148.826%20134.394%20145%20140.027%20145%20144c0%203.973%203.826%209.606%2013.77%2014.578C168.713%20163.55%20183.543%20167%20200%20167c16.457%200%2031.287-3.45%2041.23-8.422C251.174%20153.606%20255%20147.973%20255%20144c0-3.973-3.826-9.606-13.77-14.578C231.287%20124.45%20216.457%20121%20200%20121zM81%20139.47V144c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.328%201.826%2013.32%202.993%2020.503%203.53V152.75c-8.772-.594-17.406-2.057-25.496-4.393-7.797-2.25-14.69-5.203-20.504-8.89zm240%207.305v4.555c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233-13.22%206.61-30.39%2010.322-49.28%2010.322s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm-48%204.246v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zm-128%2020.425V176c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C236.06%20181.288%20218.89%20185%20200%20185s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm-64%20.024V176c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.328%201.826%2013.32%202.993%2020.503%203.53V184.75c-8.772-.594-17.406-2.057-25.496-4.393-7.797-2.25-14.69-5.203-20.504-8.89zm240%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.688-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.202-20.504-8.89zm-48%204.22v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zM81%20203.47V208c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%206.328%201.826%2013.32%202.993%2020.503%203.53V216.75c-8.772-.594-17.406-2.057-25.496-4.393-7.797-2.25-14.69-5.203-20.504-8.89zm64%200V208c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm176%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.688-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.202-20.504-8.89zm-48%204.22v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zm-128%2020.45v2.288c2.9%201.073%205.67%202.26%208.28%203.564%209.038%204.52%2016.802%2010.795%2020.812%2018.692%2017.338%204.196%2038.678%203.883%2055.412-.948%208.954-2.585%2015.845-6.245%2020.03-9.87%204.183-3.622%205.466-6.68%205.466-9.196v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm176%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.285%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.585%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.688-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.202-20.504-8.89zm-48%204.22v13.65c9.435%201.962%2019.865%202.647%2030%202.06v-13.878c-10.064.53-20.263-.08-30-1.83zM104%20249c-16.457%200-31.287%203.45-41.23%208.422C52.826%20262.394%2049%20268.027%2049%20272c0%203.973%203.826%209.606%2013.77%2014.578C72.713%20291.55%2087.543%20295%20104%20295c16.457%200%2031.287-3.45%2041.23-8.422C155.174%20281.606%20159%20275.973%20159%20272c0-3.973-3.826-9.606-13.77-14.578C135.287%20252.45%20120.457%20249%20104%20249zm151%2018.47c-5.813%203.687-12.707%206.64-20.504%208.89-17.97%205.187-38.608%206.05-57.496%202.642v13.664c16.775%203.494%2036.694%202.964%2052.504-1.6%208.954-2.585%2015.845-6.245%2020.03-9.87%204.183-3.622%205.466-6.68%205.466-9.196v-4.53zm66%207.33v4.53c0%202.515%201.283%205.574%205.467%209.197%204.045%203.503%2010.64%207.03%2019.162%209.598%203.74-3.428%208.228-6.37%2013.09-8.803%201.152-.575%202.344-1.12%203.553-1.652-7.14-.744-14.137-2.066-20.77-3.98-7.796-2.25-14.69-5.202-20.503-8.89zm110%200c-2.84%201.8-5.938%203.422-9.27%204.876%203.1.31%206.13.734%209.082%201.252.12-.553.188-1.09.188-1.598v-4.53zm-158%204.22v13.62c6.997%201.482%2014.783%202.36%2023%202.36%202.374%200%204.705-.087%207-.227v-13.92c-10.064.53-20.263-.082-30-1.832zM408%20297c-16.457%200-31.287%203.45-41.23%208.422C356.826%20310.394%20353%20316.027%20353%20320c0%203.973%203.826%209.606%2013.77%2014.578C376.713%20339.55%20391.543%20343%20408%20343c16.457%200%2031.287-3.45%2041.23-8.422C459.174%20329.606%20463%20323.973%20463%20320c0-3.973-3.826-9.606-13.77-14.578C439.287%20300.45%20424.457%20297%20408%20297zm-359%202.445V304c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C140.06%20309.288%20122.89%20313%20104%20313s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm206%20.024c-5.813%203.687-12.707%206.64-20.504%208.89-17.97%205.187-38.608%206.05-57.496%202.642v13.664c16.775%203.494%2036.694%202.964%2052.504-1.6%208.954-2.585%2015.845-6.245%2020.03-9.87%204.183-3.622%205.466-6.68%205.466-9.196v-4.53zm66%207.33v4.53c0%203.973%203.826%209.606%2013.77%2014.578.074.037.155.073.23.11V313.56c-5.168-1.89-9.862-4.135-14-6.76zM49%20331.47V336c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zM177%20343v13.648c4.885%201.032%2010.16%201.767%2015.697%202.114%201.985-5.246%205.602-9.84%2010.207-13.756-8.726.19-17.487-.487-25.904-2.006zM264%20345c-16.457%200-31.287%203.45-41.23%208.422C212.826%20358.394%20209%20364.027%20209%20368c0%203.973%203.826%209.606%2013.77%2014.578C232.713%20387.55%20247.543%20391%20264%20391c16.457%200%2031.287-3.45%2041.23-8.422C315.174%20377.606%20319%20371.973%20319%20368c0-3.973-3.826-9.606-13.77-14.578C295.287%20348.45%20280.457%20345%20264%20345zm89%202.445V352c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C444.06%20357.288%20426.89%20361%20408%20361s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zM49%20363.47V368c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm304%2016V384c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm-144%2015.975V400c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.555c-1.832%201.158-3.74%202.243-5.72%203.233C300.06%20405.288%20282.89%20409%20264%20409s-36.06-3.712-49.28-10.322c-1.98-.99-3.888-2.075-5.72-3.233zm-160%20.024V400c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm304%2016V416c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm-304%2016V432c0%202.515%201.283%205.574%205.467%209.197%204.184%203.624%2011.075%207.284%2020.03%209.87%2017.908%205.17%2041.098%205.17%2059.007%200%208.954-2.586%2015.845-6.246%2020.03-9.87%204.183-3.623%205.466-6.682%205.466-9.197v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm160%200V432c0%203.973%203.826%209.606%2013.77%2014.578C232.713%20451.55%20247.543%20455%20264%20455c16.457%200%2031.287-3.45%2041.23-8.422C315.174%20441.606%20319%20435.973%20319%20432v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm144%2016V448c0%203.973%203.826%209.606%2013.77%2014.578C376.713%20467.55%20391.543%20471%20408%20471c16.457%200%2031.287-3.45%2041.23-8.422C459.174%20457.606%20463%20451.973%20463%20448v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89zm-304%2016V464c0%203.973%203.826%209.606%2013.77%2014.578C72.713%20483.55%2087.543%20487%20104%20487c16.457%200%2031.287-3.45%2041.23-8.422C155.174%20473.606%20159%20467.973%20159%20464v-4.53c-5.813%203.687-12.707%206.64-20.504%208.89-21.694%206.262-47.298%206.262-68.992%200-7.797-2.25-14.69-5.203-20.504-8.89z\"%20fill%3D\"%23fff\"%20fill-opacity%3D\"1\"><%2Fpath><%2Fg><%2Fsvg>'); }\n\n.directions-card {\n  background-image: url('data:image/svg+xml;charset=utf-8,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%20512%20512\"%20style%3D\"height%3A%20512px%3B%20width%3A%20512px%3B\"><path%20d%3D\"M0%200h512v512H0z\"%20fill%3D\"%23000\"%20fill-opacity%3D\"1\"><%2Fpath><g%20class%3D\"\"%20transform%3D\"translate(0%2C0)\"%20style%3D\"touch-action%3A%20none%3B\"><path%20d%3D\"M277.3%2035.11l-32.1%202.12-1%2032.93%2033.6.05-.5-35.1zM151.7%2088.04L67.96%20118.9%20152%20169.2l188-6.2%202.4-74.72-190.7-.24zM279.2%20183l-38.3%201.3-.8%2027.8%2039.5%201.2-.4-30.3zm-93.1%2045.6l.8%2064.2%20200.4.9%2051.7-29.2-55.8-30.2-197.1-5.7zm51.1%2082.5l-5%20175.3%2050.9.6-2.3-175.7-43.6-.2z\"%20fill%3D\"%23fff\"%20fill-opacity%3D\"1\"><%2Fpath><%2Fg><%2Fsvg>'); }\n\n.event-list {\n  margin-top: 50px;\n  margin-bottom: 23px;\n  display: block;\n  height: 0px;\n  border: 2px solid #333;\n  border-radius: 5px;\n  list-style: none;\n  position: relative; }\n  .event-list::after {\n    content: '';\n    display: block;\n    position: absolute;\n    top: -25px;\n    left: 56px;\n    z-index: -1;\n    width: 4px;\n    height: 50px;\n    background: #333; }\n  .event-list li {\n    width: 34px;\n    display: block;\n    position: absolute;\n    top: -17px;\n    transition: transform 750ms ease-in-out; }\n    .event-list li .inner {\n      border: 1px solid #aaa; }\n    .event-list li div {\n      width: 34px;\n      height: 34px;\n      box-sizing: border-box;\n      text-align: center;\n      background-color: #fff; }\n\n.downbounce {\n  animation-name: bounce;\n  animation-duration: 750ms;\n  animation-timing-function: ease-in-out; }\n\n.upbounce {\n  animation-name: bounce2;\n  animation-duration: 750ms;\n  animation-timing-function: ease-in-out; }\n\n.spin1 {\n  animation-name: spin;\n  animation-duration: 500ms;\n  animation-timing-function: ease-in-out; }\n\n.grow1 {\n  animation-name: grow;\n  animation-duration: 500ms;\n  animation-timing-function: ease-in-out; }\n\n@keyframes spin {\n  0% {\n    transform: rotateZ(-90deg);\n    opacity: 0; }\n  100% {\n    transform: rotateZ(0deg);\n    opacity: 1; } }\n\n@keyframes bounce {\n  0% {\n    transform: translateY(0px); }\n  50% {\n    transform: translateY(48px); }\n  100% {\n    transform: translateY(0px); } }\n\n@keyframes bounce2 {\n  0% {\n    transform: translateY(0px); }\n  50% {\n    transform: translateY(-48px); }\n  100% {\n    transform: translateY(0px); } }\n\n@keyframes grow {\n  0% {\n    width: 34px;\n    height: 34px;\n    transform: translateX(0px) translateY(0px); }\n  100% {\n    width: 258px;\n    height: 256px;\n    transform: translateX(-42px) translateY(-340px); } }\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(8);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 8 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bus = __webpack_require__(1);

var _bus2 = _interopRequireDefault(_bus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Big dumb player object
var Player = {
  name: "",
  health: 15,
  max_health: 15,
  mana: 15,
  max_mana: 15,
  exp: 0,
  next_level: 1000,
  gold: 0,

  items: {
    "Potion of Healing": { "count": 1, "effect": "Heal", "callback": function callback(c) {
        c.changeResource("health", 5);
      }, "range": 1 }
  },

  changeResource: function changeResource(name, amount) {
    this[name] += amount;
    _bus2.default.pub(name + "-amount", this[name]);
  }
};

exports.default = Player;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bar = exports.Bar = function (_Hookable) {
  _inherits(Bar, _Hookable);

  function Bar(options) {
    _classCallCheck(this, Bar);

    var parent = options.parent,
        name = options.name;
    return _possibleConstructorReturn(this, (Bar.__proto__ || Object.getPrototypeOf(Bar)).call(this, {
      parent: parent,
      template: "<div class='bar-outer " + name + "' data-hook='container'>\n            <div class='progress-shadow' data-hook='shadow'></div>\n            <div class='progress' data-hook='progress'></div>\n            <div class='readout' data-hook='readout'></div>\n           </div>"
    }));
  }

  _createClass(Bar, [{
    key: "setText",
    value: function setText(text) {
      this.readout.innerText = text;
    }
  }, {
    key: "setPercentage",
    value: function setPercentage(percentage) {
      var _this2 = this;

      this.progress.style.width = percentage + "%";
      setTimeout(function () {
        return _this2.shadow.style.width = percentage + "%";
      }, 1500);
    }
  }]);

  return Bar;
}(_helpers.Hookable);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Event = exports.EventList = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = __webpack_require__(0);

var _cards = __webpack_require__(2);

var _creature = __webpack_require__(12);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var event_types = ['monster', 'money', 'directions'];

// Better to call it an event "loop", with a movable pointer to the current card.

var EventList = exports.EventList = function (_Hookable) {
  _inherits(EventList, _Hookable);

  function EventList(options) {
    _classCallCheck(this, EventList);

    var parent = options.parent;

    var _this = _possibleConstructorReturn(this, (EventList.__proto__ || Object.getPrototypeOf(EventList)).call(this, {
      parent: parent,
      template: '<ul data-hook=\'container\' class=\'event-list\'>\n                    </ul>'
    }));

    _this._events = [];
    return _this;
  }

  _createClass(EventList, [{
    key: 'add',
    value: function add() {
      var e = new Event({ parent: this.container, position: this._events.length, card: new _cards.CreatureCard({ creature: (0, _creature.getCreature)() }) });
      e.inner.classList.add('spin1');
      this._events.push(e);
      this.reposition();
    }
  }, {
    key: 'addAtIndex',
    value: function addAtIndex(index) {
      var e = new Event({ parent: this.container, position: 1, card: new _cards.CreatureCard({ creature: (0, _creature.getCreature)() }) });
      e.inner.classList.add('spin1');
      this._events.splice(index, 0, e);
      this.reposition();
    }
  }, {
    key: 'push',
    value: function push(c) {
      var e = new Event({ parent: this.container, position: this._events.length, card: c });
      e.inner.classList.add('spin1');
      this._events.unshift(e);
      this.reposition();
    }
  }, {
    key: 'peek',
    value: function peek(idx) {
      idx = idx || 0;
      return this._events[idx];
    }
  }, {
    key: 'pop',
    value: function pop() {
      var m = this._events.shift();
      this.reposition();
      m.destroy();
      return m;
    }
  }, {
    key: 'unshift',
    value: function unshift(c) {
      var e = new Event({ parent: this.container, position: 0, card: c });
      e.inner.classList.add('spin1');
      this._events.unshift(e);
      this.reposition();
    }
  }, {
    key: 'reposition',
    value: function reposition() {
      // call this to resync 
      this._events.map(function (e, idx) {
        return e.reposition(idx);
      });
    }
  }]);

  return EventList;
}(_helpers.Hookable);

var Event = exports.Event = function (_Hookable2) {
  _inherits(Event, _Hookable2);

  function Event(options) {
    _classCallCheck(this, Event);

    var parent = options.parent,
        position = options.position,
        card = options.card;

    var _this2 = _possibleConstructorReturn(this, (Event.__proto__ || Object.getPrototypeOf(Event)).call(this, {
      parent: parent,
      template: '<li data-hook=\'outer\'>\n                      <div data-hook=\'inner\' class=\'inner\'> \n                        <div data-hook=\'contents\' class=\'contents ' + card.type + '-card\'>\n                        </div>\n                      </div>\n                     </li>'
    }));

    _this2.card = card;
    _this2.position = position;
    return _this2;
  }

  _createClass(Event, [{
    key: 'reposition',
    value: function reposition(rank) {

      this.outer.style.transform = "translateX(" + rank * 48 + "px)";
      if (this.position !== null && Math.abs(this.position - rank) > 1) {
        this.inner.className = 'inner';

        var anim = this.position < rank ? 'upbounce' : 'downbounce';
        this.inner.classList.add(anim);
      }
      this.position = rank;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.parent.removeChild(this.outer);
    }
  }]);

  return Event;
}(_helpers.Hookable);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Creature = function () {
  function Creature() {
    _classCallCheck(this, Creature);

    this.health = 20;
    this.maxhealth = 20;
    this.name = 'Goblin';
  }

  _createClass(Creature, [{
    key: 'changeResource',
    value: function changeResource(res, val) {
      this[res] += val;
    }
  }, {
    key: 'description',
    get: function get() {
      return this.health < this.maxhealth ? 'A Wounded ' + this.name + ' (' + this.health + '/' + this.maxhealth + ' HP)' : 'A ' + this.name;
    }
  }, {
    key: 'dead',
    get: function get() {
      return this.health <= 0;
    }
  }]);

  return Creature;
}();

var getCreature = exports.getCreature = function getCreature() {
  return new Creature();
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dialogue = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = __webpack_require__(0);

var _choice = __webpack_require__(14);

var _choice2 = _interopRequireDefault(_choice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dialogue = exports.Dialogue = function (_Hookable) {
  _inherits(Dialogue, _Hookable);

  function Dialogue(options) {
    _classCallCheck(this, Dialogue);

    var parent = options.parent;
    return _possibleConstructorReturn(this, (Dialogue.__proto__ || Object.getPrototypeOf(Dialogue)).call(this, {
      parent: parent,
      template: '<div class=\'big-card\' data-hook=\'container\'>\n                  <div class=\'card-image\'>\n                    <div class=\'card-image-inner\'></div>\n                  </div>\n                  <div class=\'content\' data-hook=\'contents\'>\n                  </div>\n                 </div>\n                '
    }));
  }

  _createClass(Dialogue, [{
    key: 'setStack',
    value: function setStack(q) {
      this.stack = q;
    }
  }, {
    key: 'hydrate',
    value: function hydrate(event) {
      event.card.buildContents(this.stack, this.contents);
    }
  }]);

  return Dialogue;
}(_helpers.Hookable);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Choice = function (_Hookable) {
  _inherits(Choice, _Hookable);

  function Choice(options) {
    _classCallCheck(this, Choice);

    var parent = options.parent,
        handleClick = options.handleClick,
        label = options.label,
        effect = options.effect;

    var _this = _possibleConstructorReturn(this, (Choice.__proto__ || Object.getPrototypeOf(Choice)).call(this, {
      parent: parent,
      template: '<button class=\'choice-button\' data-hook=\'container\'>\n                   <div class=\'label\'>' + label + '</div>\n                   <div class=\'effect\'>' + effect + '</div>\n                 </button>'
    }));

    _this.container.addEventListener('click', function () {
      return handleClick();
    });
    return _this;
  }

  return Choice;
}(_helpers.Hookable);

exports.default = Choice;

/***/ })
],[3]);