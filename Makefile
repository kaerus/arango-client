REPORTER = spec
ASSERTER = chai
TESTER = @./node_modules/mocha/bin/mocha
EXECUTE = $(TESTER) --reporter $(REPORTER) --require $(ASSERTER) --ui tdd

test:
	$(EXECUTE) test/*.js

.PHONY: test
