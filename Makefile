REPORTER = spec
TESTER_BIN = @env mocha
TESTER_OPT = --reporter $(REPORTER) --require chai --ui tdd
TEST_CMD = $(TESTER_BIN) $(TESTER_OPT)

test:
	$(TEST_CMD) test/*.js

.PHONY: test
