#!/bin/bash 

IMAGE="grant-mgmt-client"

# Stop and remove existing container
if [ "$(docker ps -a -f name=$IMAGE)" ]; then
    echo "Stopping and removing existing $IMAGE container..."
    docker stop $IMAGE
    docker rm $IMAGE
fi

# Remove existing image
if [ "$(docker images -q $IMAGE)" ]; then
    echo "Removing existing $IMAGE image..."
    docker rmi $IMAGE
fi

# Build image
echo "Building the new $IMAGE Docker image..."
docker build -t $IMAGE .

# Run container
echo "Running the new $IMAGE Docker container..."
docker run -d -p 8081:8081 --name $IMAGE $IMAGE