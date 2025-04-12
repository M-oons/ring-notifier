APP_NAME := ring-notifier
TSC := .\node_modules\.bin\tsc
ELECTRON_FORGE := .\node_modules\.bin\electron-forge

.PHONY: all build package clean

all: clean build package

run: build
	(set NODE_ENV=development) && $(ELECTRON_FORGE) start

build:
	@-rmdir /s /q dist
	@$(TSC)
	@xcopy src\assets dist\assets /E /I /Y

package:
	$(ELECTRON_FORGE) make

clean:
	@-rmdir /s /q dist
	@-rmdir /s /q out
	@-del $(APP_NAME).exe
