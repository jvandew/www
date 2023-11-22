#! /usr/bin/env bash

set -eo pipefail

virtualenv .env
source .env/bin/activate

pip install -r requirements.txt --isolated --only-binary=:all:

