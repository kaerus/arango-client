REPORTER = spec
TESTER = @./node_modules/mocha/bin/mocha
BUILDER = @./node_modules/requirejs/bin/r.js
BUILD_DIR = ./dist
BUILD = $(BUILD_DIR)/arango.out
EXECUTE = $(TESTER) --reporter $(REPORTER) --ui tdd

test:
	$(EXECUTE) test/[0-9][0-9].*
dist:
	$(BUILDER) -o name=index out=$(BUILD) baseUrl=. preserveLicenseComments=false
	@cat ./LICENSE $(BUILD) > $(BUILD_DIR)/arango.js
	@rm $(BUILD)

.PHONY: test dist
