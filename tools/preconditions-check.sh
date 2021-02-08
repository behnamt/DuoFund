#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NO_COLOR='\033[0m'
CHECK_MARK='\xE2\x9C\x93'
ERROR='\xE2\x9D\x8C'

PASS=true

command -v yarn >/dev/null 2>&1

if [[ "$?" == 0 ]]; then
  printf "${GREEN}${CHECK_MARK} found yarn installed${NO_COLOR}\n"
else
  printf "${RED}${ERROR} No yarn installed, consider running npm install -g yarn${NO_COLOR}\n"
  PASS=false
fi

NVM_EXECUTABLE=~/.nvm/nvm.sh
if test -f "$NVM_EXECUTABLE"; then
  printf "${GREEN}${CHECK_MARK} found nvm installed${NO_COLOR}\n"
else
  printf "${RED}${ERROR} No nvm installed, see https://github.com/nvm-sh/nvm#install--update-script for install-instructions ${NO_COLOR}\n"
  PASS=false
fi

if ! $PASS; then
  exit 1
else
  exit 0
fi
