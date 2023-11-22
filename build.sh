#! /usr/bin/env bash

set -eo pipefail

docker build -t "www:$(date '+%Y%m%d')-$(git rev-parse --short HEAD)" .

