#! /usr/bin/env bash

set -eo pipefail

virtualenv -p "$(which python3)" .env
source .env/bin/activate

pip install -r requirements.txt --isolated --only-binary=:all:

