.PHONY: all build test clean example lint doc

all: test build

build:
	go build ./...

test:
	go test -v -race ./...

example:
	go run ./cmd/example/main.go

doc:
	@echo "📖 Starting pkgsite documentation server on http://localhost:6060 ..."
	@echo "Open http://localhost:6060/github.com/Nam088/telebot-go in your browser"
	$$(go env GOPATH)/bin/pkgsite -http=:6060

clean:
	go clean
