require("../test/common");
var gently = new (require("gently"))(),
  stream = new (require("fs").WriteStream)("my_file.txt");
gently.expect(stream, "emit", function (event) {
	"use strict";
	assert.equal(event, "open");
});
gently.expect(stream, "emit", function (event) {
	"use strict";
	assert.equal(event, "drain");
});