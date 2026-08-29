.PHONY: all build test clean example lint

all: test build

build:
	go build ./...

test:
	go test -v -race ./...

example:
	go run ./cmd/example/main.go

clean:
	go clean
