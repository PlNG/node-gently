var path = require("path");
function Gently() {
  "use strict";
	this.expectations = [];
	this.hijacked = {};
	var self = this;
	process.addListener("exit", function () {
		self.verify("process exit");
	});
}
module.exports = Gently;
Gently.prototype.stub = function (location, exportsName) {
	"use strict";
	function Stub() {
		return Stub["new"].apply(this, arguments);
	}
	Stub["new"] = function () {};
	var stubName = "require(" + JSON.stringify(location) + ")",
		exports;
	if (exportsName) {
		stubName += "." + exportsName;
	}
	Stub.prototype.toString = Stub.toString = function () {
		return stubName;
	};
	exports = this.hijacked[location] || {};
	if (exportsName) {
		exports[exportsName] = Stub;
	} else {
		exports = Stub;
	}
	this.hijacked[location] = exports;
	return Stub;
};
Gently.prototype.hijack = function (realRequire) {
	"use strict";
	var self = this;
	return function (location) {
		return self.hijacked[location] || realRequire(location);
	};
};
Gently.prototype.expect = function (obj, method, count, stubFn) {
	"use strict";
	if (typeof obj !== "function" && typeof obj !== "object" && typeof obj !== "number") {
		throw new Error("Bad 1st argument for gently.expect(), " + "object, function, or number expected, got: " + typeof obj);
	} else {
		if (typeof obj === "function" && typeof method !== "string") {
			stubFn = obj;
			obj = null;
			method = null;
			count = 1;
		} else {
			if (typeof method === "function") {
				count = obj;
				stubFn = method;
				obj = null;
				method = null;
			} else {
				if (typeof count === "function") {
					stubFn = count;
					count = 1;
				} else {
					if (count === undefined) {
						count = 1;
					}
				}
			}
		}
	}
	var name = this._name(obj, method, stubFn),
		self,
		original;
	this.expectations.push({
		obj: obj,
		method: method,
		stubFn: stubFn,
		name: name,
		count: count
	});
	self = this;
	function delegate() {
		return self._stubFn(this, obj, method, name, Array.prototype.slice.call(arguments));
	}
	if (!obj) {
		return delegate;
	}
	original = obj[method] ? obj[method]._original || obj[method] : undefined;
	obj[method] = delegate;
	return (obj[method]._original = original);
};
Gently.prototype.restore = function (obj, method) {
	"use strict";
	if (!obj[method] || !obj[method]._original) {
		throw new Error(this._name(obj, method) + " is not gently stubbed");
	}
	obj[method] = obj[method]._original;
};
Gently.prototype.verify = function (msg) {
	"use strict";
	if (!this.expectations.length) {
		return;
	}
	var i,
		l = this.expectations.length,
		expectation,
		validExpectations = [];
	for (i = 0; i < l; i += 1) {
		expectation = this.expectations[i];
		if (expectation.count > 0) {
			validExpectations.push(expectation);
		}
	}
	if (!validExpectations.length) {
		return;
	}
	expectation = validExpectations[0];
	throw new Error("Expected call to " + expectation.name + " did not happen" + (msg ? " (" + msg + ")" : ""));
};
Gently.prototype._stubFn = function (self, obj, method, name, args) {
	"use strict";
	var expectation = this.expectations[0],
		has_more_expectations;
	if (!expectation) {
		throw new Error("Unexpected call to " + name + ", no call was expected");
	}
	if (expectation.obj !== obj || expectation.method !== method) {
		throw new Error("Unexpected call to " + name + ", expected call to " + expectation.name);
	}
	expectation.count -= 1;
	if (expectation.count === 0) {
		this.expectations.shift();
		has_more_expectations = this.expectations.reduce(function (memo, expectation) {
			return memo || expectation.obj === obj && expectation.method === method;
		}, false);
		if (obj !== null && method !== null && !has_more_expectations) {
			if (typeof obj[method]._original !== "undefined") {
				obj[method] = obj[method]._original;
				delete obj[method]._original;
			} else {
				delete obj[method];
			}
		}
	}
	if (expectation.stubFn) {
		return expectation.stubFn.apply(self, args);
	}
};
Gently.prototype._name = function (obj, method, stubFn) {
	"use strict";
	if (obj) {
		var objectName = obj.toString();
		if (objectName === "[object Object]" && obj.constructor.name) {
			objectName = "[" + obj.constructor.name + "]";
		}
		return objectName + "." + method + "()";
	}
	if (stubFn.name) {
		return stubFn.name + "()";
	}
	return ">> " + stubFn.toString() + " <<";
};