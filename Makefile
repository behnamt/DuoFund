#COLORS
GREEN  := $(shell tput -Txterm setaf 2)
WHITE  := $(shell tput -Txterm setaf 7)
YELLOW := $(shell tput -Txterm setaf 3)
CYAN_BG := $(shell tput -Txterm setab 6)
RESET  := $(shell tput -Txterm sgr0)

# Add the following 'help' target to your Makefile
# And add help text after each target name starting with '\#\#'
# A category can be added with @category
HELP_FUN = \
	%help; \
	while(<>) { push @{$$help{$$2 // 'options'}}, [$$1, $$3] if /^([a-zA-Z\-]+)\s*:.*\#\#(?:@([a-zA-Z\-]+))?\s(.*)$$/ }; \
	print "usage: make [target]\n\n"; \
	for (sort keys %help) { \
	print "${WHITE}$$_:${RESET}\n"; \
	for (@{$$help{$$_}}) { \
	$$sep = " " x (32 - length $$_->[0]); \
	print "  ${YELLOW}$$_->[0]${RESET}$$sep${GREEN}$$_->[1]${RESET}\n"; \
	}; \
	print "\n"; }

GREEN_BG := $(shell tput -Txterm setab 2)
NOTICE_ENV_FILE = \
    \#\#\# !!! \n\
    \# \n\
    \# Created initial .env/.env.local file in the submodules root folder \n\
    \# \n\
    \# Modify the settings to enable/disable/change certain features. \n\
    \# \n\
    \# Have a look at the file to get to know the options. \n\
    \# \n\
    \#\#\# !!!

MAKE = make --no-print-directory
DOCKER = docker
DOCKER_COMPOSE = docker-compose

# Process parameters/options
ifeq (logs,$(firstword $(MAKECMDGOALS)))
    LOGS_TAIL := 0
    ifdef tail
        LOGS_TAIL := $(tail)
    endif
endif

.PHONY: help
help: ##@other show this help.
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)

app/.env.local: ##@development create .env file (if not present)
	cp $(CURDIR)/packages/app/.env $(CURDIR)/packages/app/.env.local
	@perl -e 'print "\n${GREEN_BG} ${NOTICE_ENV_FILE}${RESET}\n\n";'

contracts/.env.local: ##@development create .env file (if not present)
	cp $(CURDIR)/packages/contracts/.env $(CURDIR)/packages/contracts/.env.local
	@perl -e 'print "\n${GREEN_BG} ${NOTICE_ENV_FILE}${RESET}\n\n";'

env: ##@setup Create local env file
	$(MAKE) app/.env.local
	$(MAKE) contracts/.env.local
.PHONY: env

setup: ##@setup Create dev environment
	$(MAKE) env
	$(MAKE) npm-prepare
	$(MAKE) npm-install
	$(MAKE) start
	$(MAKE) contracts-deploy
	$(MAKE) build-core
	$(MAKE) ipfs-cors
.PHONY: setup


contracts-deploy: ##@contracts Deploy current contract
	./tools/deploy-contracts.sh
.PHONY: contracts-deploy

build-core: ##@core build core
	./tools/build-core.sh
.PHONY: build-core

npm-prepare: ##@setup look for yarn and nvm
	./tools/preconditions-check.sh
.PHONY: npm-prepare

npm-install: ##@setup installs node-dependencies
	./tools/npm-install.sh
.PHONY: npm-install

npm-cleanup: ##@cleanup remove all node_modules
	rm -rf ./packages/contracts/node_modules
	rm -rf ./packages/core/node_modules
	rm -rf ./packages/app/node_modules
.PHONY: npm-cleanup

start: ##@development start containers
	docker-compose up -d
.PHONY: start

stop: ##@development stop containers
	docker-compose stop -t 1
.PHONY: stop

restart: ##@development restart containers
	$(MAKE) stop
	$(MAKE) start
.PHONY: restart

logs: ##@development show server logs (default: 0, use parameter 'tail=<#|all>, e.g. call 'make logs tail=all' for all logs, add `make logs tail=10' or any number for specific amount of lines)
	$(DOCKER_COMPOSE) logs -f --tail=$(LOGS_TAIL)
.PHONY: logs

clean: ##@setup removes servers
	$(MAKE) stop
	$(DOCKER_COMPOSE) down --remove-orphans
	$(MAKE) npm-cleanup
.PHONY: clean

rebuild: clean ##@development removes images
	$(DOCKER_COMPOSE) down --remove-orphans --rmi all
	$(MAKE) npm-cleanup
	$(MAKE) setup
.PHONY: rebuild

gh-deploy: ##@deploy to github pages
	./tools/gh-pages-deploy.sh
.PHONY: gh-deploy
################ service setup #######################

ipfs-cors: ##@development configure IPFS container for CORS
	$(DOCKER_COMPOSE) exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
	$(DOCKER_COMPOSE) exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
	$(DOCKER_COMPOSE) exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers: '["X-Requested-With","Range","User-Agent"]'
	$(DOCKER_COMPOSE) exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
	$(DOCKER_COMPOSE) exec ipfs ipfs config --json Addresses.Swarm '["/ip4/0.0.0.0/tcp/4001", "/ip6/::/tcp/4001", "/ip4/0.0.0.0/tcp/4003/ws"]'
.PHONY: ipfs-cors
