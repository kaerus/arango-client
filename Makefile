REPORTER = spec
TESTER = @./node_modules/mocha/bin/mocha
EXECUTE = $(TESTER) --reporter $(REPORTER) --ui tdd

test:
	$(EXECUTE) test/[0-9][0-9].*

.PHONY: test
