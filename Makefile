REPORTER = spec
TESTER = @./node_modules/mocha/bin/mocha
BUILDER = @./node_modules/requirejs/bin/r.js
BUILD_DIR = ./dist
BUILD = $(BUILD_DIR)/arango.out
EXECUTE = $(TESTER) --reporter $(REPORTER) --ui tdd

test:
	$(EXECUTE) test/[0-9][0-9].*
dist:
	$(BUILDER) -o name=arango out=$(BUILD) baseUrl=./lib preserveLicenseComments=false
	@cat ./COPYRIGHT $(BUILD) > $(BUILD_DIR)/arango.js
	@gzip -9 $(BUILD_DIR)/arango.js -c > $(BUILD_DIR)/arango.js.gz
	@rm $(BUILD)

.PHONY: test dist
