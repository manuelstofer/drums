all: components build

components:
	@component install

build:
	@component build

.PHONY: build

