**1. Build Docker Images:**

```bash
docker-compose build
```

This command builds the Docker images defined in the `docker-compose.yml` file. Ensure that the MongoDB image (specified as `mymongodb:latest`) is built using the Dockerfile provided earlier.

**2. Run Docker Containers:**

```bash
docker-compose up -d
```

This command starts the Docker containers defined in the `docker-compose.yml` file in detached mode (`-d`).

**3. Additional Information:**

- The `mongodb` service represents the MongoDB container, which is configured to run in replica set mode.
- The `mongo-init` service runs a command to initiate the replica set. It sleeps for 5 seconds to allow the MongoDB container to start before executing the initialization script (`init-replica-set.js`).
- The MongoDB container exposes port `27017`, and it is mapped to the host port `27017` for external access.
- The containers are connected to a custom network named `mynetwork` to enable communication between them.

**Note:** Ensure that you have Docker and Docker Compose installed on your system before executing these commands. Adjust the version numbers in the `docker-compose.yml` file if necessary.
