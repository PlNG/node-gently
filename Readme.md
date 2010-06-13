# Gently

## Purpose

A node.js module that helps with mocking and behavior verification.

## Features

* Overwrite and mock individual object functions
* Verify that all expected calls have been made in the expected order
* Restore mocked functions to their original behavior
* Detect object / class names from obj.constructor.name and obj.toString()

## Installation

Via [npm](http://github.com/isaacs/npm):

    npm install gently@latest

## Example

Make sure your dog is working properly:

    function Dog() {}

    Dog.prototype.seeCat = function() {
      this.bark('whuf, whuf');
      this.run();
    }

    Dog.prototype.bark = function(bark) {
      require('sys').puts(bark);
    }

    var gently = new (require('gently'))
      , assert = require('assert')
      , dog = new Dog();

    gently.expect(dog, 'bark', function(bark) {
      assert.equal(bark, 'whuf, whuf');
    });
    gently.expect(dog, 'run');

    dog.seeCat();

You can also easily test event emitters with this, for example a simple sequence of 2 events emitted by `fs.WriteStream`:

    var gently = new (require('gently'))
      , stream = new (require('fs').WriteStream)('my_file.txt');

    gently.expect(stream, 'emit', function(event) {
      assert.equal(event, 'open');
    });

    gently.expect(stream, 'emit', function(event) {
      assert.equal(event, 'drain');
    });

For a full read world example, check out this test case: [test-incoming-form.js](http://github.com/felixge/node-formidable/blob/master/test/simple/test-incoming-form.js) (in [node-formdiable](http://github.com/felixge/node-formidable)).

## API

### Gently

#### new Gently()

Creates a new gently instance. It listens to the process `'exit'` event to make sure all expectations have been verified.

#### gently.expect(obj, method, [[count], mock])

Creates an expectation for an objects method to be called. You can optionally specify the call `count` you are expecting, as well as `mock` function that will run instead of the original function.

Returns a reference to the function that is getting overwritten.

#### gently.expect([count], mock)

Returns a function that is supposed to be executed `count` times, delegating any calls to the provided `mock` function. Naming your mock closure will help to properly diagnose errors that are being thrown:

    childProcess.exec('ls', gently.expect(function lsCallback(code) {
      assert.equal(0, code);
    }));

#### gently.restore(obj, method)

Restores an object method that has been previously overwritten using `gently.expect()`.

#### gently.verify([msg])

Verifies that all expectations of this gently instance have been satisfied. If not called manually, this method is called when the process `'exit'` event is fired.

If `msg` is given, it will appear in any error that might be thrown.

## License

Gently is licensed under the MIT license.