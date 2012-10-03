BUILDER = @./node_modules/requirejs/bin/r.js
BUILD_DIR = ./dist
BUILD = $(BUILD_DIR)/arango.out

dist:
	$(BUILDER) -o name=arango out=$(BUILD) baseUrl=./lib preserveLicenseComments=false
	@cat ./COPYRIGHT $(BUILD) > $(BUILD_DIR)/arango.js
	@gzip -9 $(BUILD_DIR)/arango.js -c > $(BUILD_DIR)/arango.js.gz
	@rm $(BUILD)

.PHONY: dist
