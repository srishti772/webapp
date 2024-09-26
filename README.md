# Webapp

## Description

Webapp is a Node.js application built using Express that connects to a MySQL database. This application provides a health check API and manages the connection to the database using Sequelize ORM.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)


## Installation

1. Clone the repository using SSH:

   ```bash
   git clone git@github.com:srishti772/webapp.git
   ```

2. Navigate into the project directory:

   ```bash
    cd webapp
   ```

3. Install the dependencies:

   ```bash
    npm install
   ```

## Usage

To run the application locally, make sure you have the MySQL database running and then execute the following command:

```bash
 npm start
```

## Application Availability

The application will be available at `http://localhost:3001`.

## API Endpoints

### GET /healthz

Check the health of the application.

- **Response**:
  - `200 OK` if the service is healthy.
  - `500 Internal Server Error` if the service is not healthy.

## Docker Setup

To set up the MySQL database using Docker, run the following command:

```bash
docker run --name my-mysql-container \
-e MYSQL_DATABASE=test \
-e MYSQL_USER=username \
-e MYSQL_PASSWORD=password \
-e MYSQL_ROOT_PASSWORD=rootpassword \
-p 3306:3306 -d mysql:latest
```

After the container is running, you can access the MySQL command line with:

```bash
docker exec -it my-mysql-container mysql -u username -p
```

## Enter your password when prompted.

## Environment Variables

The application requires the following environment variables:

- **PORT**: The port on which the application will run (default is `3000`).
- **MYSQL_DATABASE**: The name of the MySQL database (default is `test`).
- **MYSQL_USER**: The MySQL username (default is `root`).
- **MYSQL_PASSWORD**: The password for the MySQL user (default is `root`).
- **MYSQL_HOST**: The MySQL host (default is `127.0.0.1`).
- **MYSQL_PORT**: The port for MySQL (default is `3306`).

You can create a `.env` file in the root directory of your project with the above variables.

