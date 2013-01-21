BUILD_DIR = ./dist
BUILDER = @./node_modules/.bin/webmake
BUILD = $(BUILD_DIR)/arango
MINIFY = @./node_modules/.bin/uglifyjs 

webclient: commonjs amd
	
commonjs:
	@echo "Building CommonJS module"
	$(BUILDER) --name arango.client ./index.js $(BUILD).js
	$(MINIFY) $(BUILD).js -c -m > $(BUILD).min.js
	@gzip -9 $(BUILD).min.js -c > $(BUILD).js.gz

amd: 
	@echo "Building AMD module"
	$(BUILDER) --name arango.client ./index.js --amd $(BUILD)-amd.js
	$(MINIFY) $(BUILD)-amd.js -c -m > $(BUILD)-amd.min.js
	@gzip -9 $(BUILD)-amd.min.js -c > $(BUILD)-amd.js.gz

.PHONY: webclient
