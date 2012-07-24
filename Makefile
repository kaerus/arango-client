REPORTER = spec
ASSERTER = chai
TESTER_BIN = @./node_modules/mocha/bin/mocha
TESTER_OPT = --reporter $(REPORTER) --require $(ASSERTER) --ui tdd
TEST_CMD = $(TESTER_BIN) $(TESTER_OPT)

test:
	$(TEST_CMD) test/*.js

.PHONY: test
