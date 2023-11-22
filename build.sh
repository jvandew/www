#! /usr/bin/env bash

set -eo pipefail

readonly IMAGE_TAG="www:$(date '+%Y%m%d')-$(git rev-parse --short HEAD)"

echo "Building image ${IMAGE_TAG}..."
docker build -t "${IMAGE_TAG}" .
echo "Successfully built and tagged ${IMAGE_TAG}"

if [[ $1 == "--upload" ]]; then
    readonly REMOTE_TAG="us-central1-docker.pkg.dev/personal-website-405823/docker/${IMAGE_TAG}"

    echo "Pushing ${IMAGE_TAG} to ${REMOTE_TAG}..."
    docker tag "${IMAGE_TAG}" "${REMOTE_TAG}"
    docker push "${REMOTE_TAG}"
    echo "Successfully pushed ${REMOTE_TAG}"
fi

