require("../test/common");
function Dog() {
  "use strict";
}
Dog.prototype.seeCat = function () {
	"use strict";
	this.bark("whuf, whuf");
	this.run();
};
Dog.prototype.bark = function (bark) {
	"use strict";
	require("sys").puts(bark);
};
var gently = new (require("gently"))(),
	dog = new Dog(),
	assert = require("assert");
gently.expect(dog, "bark", function (bark) {
	"use strict";
	assert.equal(bark, "whuf, whuf");
});
gently.expect(dog, "run");
dog.seeCat();