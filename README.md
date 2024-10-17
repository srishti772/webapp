# Webapp

## Description

Webapp is a Node.js application built using Express that connects to a MySQL database. This application provides a health check API and manages the connection to the database using Sequelize ORM.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Tests](#tests)
- [Package Scripts](#package-scripts)
- [Dependencies](#dependencies)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Github Workflows](#github-workflows)

## Directory Structure

```plaintext
webapp
│───.gitignore
│───app.js
│───package-lock.json
│───package.json
│───README.md
│───server.js
│───webapp.service
├───.github
│   └───workflows
│           ├───packer-build.yml
│           ├───packer-validate.yml
│           └───webapp.yml
│
├───config
│       └───dbConnection.js
│
├───controller
│       ├───authController.js
│       └───userController.js
│
├───middleware
│       ├───allowedMethods.js
│       ├───basicAuth.js
│       ├───errorHandler.js
│       └───setHeaders.js
│
├───model
│       └───userModel.js
│
├───packer
│       ├───custom-ami.pkr.hcl
│       ├───manifest.json
│       ├───manifest.json.lock
│       └───variables.pkr.hcl
│       └───scripts
│               ├───installSoftware.sh
│               ├───setupApp.sh
│               ├───systemD.sh
│               └───updateSystem.sh
├───routes
│       ├───auth.js
│       ├───health.js
│       └───user.js
│
├───service
│       ├───authService.js
│       └───userService.js
│
└───tests
    ├───integration
    │       └───api.test.js
    │
    └───unit
            └───usercontroller.test.js
```

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

## API Endpoints

### GET /healthz

**GET** `/healthz`

- **Description**: Check the health of the application if it can connect to database or not
- **Request Body**: N/A

- **Response**:
  - `200 OK` if the service is healthy.
  - `400 Bad Request` if body is not empty or url contains query params.
  - `503 Service Unavailable` If connection fails with MySQL .
  - `405 Method Not Allowed` If any method other than GET is used to make the request

### POST /auth

- **POST** `/auth`
  - **Description**: Logs in a user and returns an authorization token.
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "your_password"
    }
    ```
  - **Response**:
    - **200 OK**: Successful login
      - **Headers**:
        - `Authorization`: `Basic <base64_encoded_email:password>`
    - **401 Unauthorized**: Invalid password
    - **404 Not Found**: User not found
    - **503 Service Unavailable**: Database error

### User Service API

## Create User

**POST** `/user`  
 **Description:** Creates a new user account.  
 **Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response**: - **201 Created**: User successfully created. - **400 Bad Request**: User already exists. - **503 Service Unavailable**: Unable to create user.

## Get User Information

**GET** `/user/self`
**Description**: Retrieves the information of the logged-in user.
**Response**:

- **200 OK**: Successfully fetched user information.
- **401 Unauthorized**: User is not authenticated.
- **404 Not Found**: User does not exist.
- **503 Service Unavailable**: Unable to fetch user.

## Update User Information

**PUT** `/user/self`
**Description**: Updates the information of the logged-in user.
**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "password": "your_password"
}
```

**Response**:
**200 OK**: Successfully updated user information.
**401 Unauthorized**: User is not authenticated.
**404 Not Found**: User does not exist.
**503 Service Unavailable**: Unable to update user.

# Middleware

## Set Headers

**Function:** `setHeaders`  
**Description:** Sets HTTP headers for the response to prevent caching.  
**Usage:** Automatically applied to all routes.

---

## Error Handler

**Function:** `errorHandler`  
**Description:** Middleware for handling errors that occur during request processing. Logs error messages and sends appropriate HTTP status codes.  
**Usage:** Automatically applied to all routes.

---

## Basic Authentication

**Function:** `basicAuth`  
**Description:** Middleware for basic authentication. It checks for the presence of an `Authorization` header and validates the user's credentials.  
**Response:**

- **401 Unauthorized:** Returned if the `Authorization` header is missing or invalid.

---

## Allowed Methods

**Function:** `allowedMethods`  
**Description:** Middleware to restrict the allowed HTTP methods for specific routes.  
**Parameters:** Accepts a list of allowed HTTP methods (e.g., `"GET"`, `"POST"`).  
**Response:**

- **405 Method Not Allowed:** Returned if a request is made with an unsupported HTTP method.

## Testing

## Integration Tests

### Register User: `POST /v1/user`

The integration tests for registering a user cover the following scenarios:

1. **Given valid user details**

   - **Test:** Should respond with `201 Created` and the correct payload.
   - **Description:** Creates a new user and verifies that the user is successfully created in the database.
   - **Example Payload:**
     ```json
     {
       "first_name": "John",
       "last_name": "Doe",
       "password": "test123",
       "email": "john.doe@example.com"
     }
     ```

2. **Given duplicate user details**

   - **Test:** Should respond with `400 Bad Request` for duplicate user.
   - **Description:** Attempts to create a user with an existing email address.
   - **Example Payload:**
     ```json
     {
       "first_name": "John",
       "last_name": "Doe",
       "email": "john.doe@example.com",
       "password": "password123"
     }
     ```

3. **Given missing required fields**
   - **Test:** Should respond with `400 Bad Request` when any required field is missing.
   - **Description:** Tests for different missing fields (e.g., `first_name`, `last_name`, `email`, `password`) and verifies appropriate error responses.

## Unit Tests

### Validate User Fields

The unit tests for the `validateUserFields` function cover the following scenarios:

1. **Should return an error if a required field is missing**

   - **Description:** Checks if the function correctly identifies missing required fields and invokes the next middleware with an error.
   - **Example User Data:**
     ```json
     {
       "last_name": "Doe",
       "email": "john.doe@example.com",
       "password": "test123"
     }
     ```

2. **Should return an error for invalid `first_name`**

   - **Description:** Tests validation of the `first_name` field for being a non-empty string.
   - **Example User Data:**
     ```json
     {
       "first_name": " ",
       "last_name": "Doe",
       "email": "john.doe@example.com",
       "password": "test123"
     }
     ```

3. **Return true if all fields are valid**
   - **Description:** Verifies that the function returns `true` and does not call the next middleware when all fields are valid.
   - **Example User Data:**
     ```json
     {
       "first_name": "John",
       "last_name": "Doe",
       "email": "john.doe@example.com",
       "password": "test123"
     }
     ```

## Package Scripts

The following scripts are defined in `package.json`:

- **Unit Testing:**

  ```bash
  npm run test:unit
  ```

  This will run only the tests located in files or directories matching the unit test pattern (e.g., files in the /tests/unit/ directory). The NODE_ENV is set to test during this process, meaning test_db will be used.

- **Integration Testing:**
  To run integration tests using Jest, execute the following command:
  ```bash
  npm run test:integration
  ```
  This will run only the tests located in files or directories matching the integration test pattern (e.g., files in the /tests/integration/ directory). Like with unit tests, the NODE_ENV is set to test and the test_db is used.

## Dependencies

### Dependencies

- `bcrypt`
- `dotenv`
- `express`
- `mysql2`
- `nodemon`
- `sequelize`
- `sqlite3`

### DevDependencies

- `cross-env`
- `jest`
- `supertest`

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

## Github Workflows

This repository utilizes GitHub Actions to automate CI/CD processes for the application. Below are the workflows set up in this project:

## packer-build.yml

**Trigger**: Runs on push to the `main` branch.

### Purpose

This workflow builds a custom AMI using Packer. It zips the web application, sets up Node.js, installs dependencies, runs unit tests, and builds an image.

### Steps

1. **Checkout code**: Uses `actions/checkout` to retrieve the code.
2. **Zip Web App**: Compresses the current directory into a `webapp.zip` file.
3. **Set up Node.js**: Configures Node.js using `actions/setup-node`.
4. **Install dependencies**: Runs `npm install` to install Node.js dependencies.
5. **Run Unit Tests**: Executes unit tests using `npm run test:unit`.
6. **Set up AWS CLI**: Configures AWS credentials using `aws-actions/configure-aws-credentials`.
7. **Set up Packer**: Configures Packer using `hashicorp/setup-packer`.
8. **Run Packer init**: Initializes Packer with the specified template.
9. **Create variables.pkr.hcl file**: Generates a configuration file for Packer variables.
10. **Format variables.pkr.hcl File**: Formats the generated configuration file.
11. **Build Image**: Runs Packer to build the AMI using the specified variables.
12. **Upload Manifest**: Uploads the Packer manifest as an artifact.

## packer-validate.yml

**Trigger**: Runs on pull requests to the `main` branch.

### Purpose

This workflow validates the Packer configuration to ensure there are no issues before merging changes.

### Steps

1. **Checkout code**: Uses `actions/checkout` to retrieve the code.
2. **Zip Web App**: Compresses the current directory into a `webapp.zip` file.
3. **Set up Packer**: Configures Packer using `hashicorp/setup-packer`.
4. **Run Packer init**: Initializes Packer with the specified template.
5. **Run Packer fmt**: Checks formatting of the Packer template.
6. **Run Packer validate**: Validates the Packer template for correctness.

## webapp.yml

**Trigger**: Runs on pull requests to the `main` branch.

### Purpose

This workflow tests the web application, ensuring that all unit and integration tests pass before merging.

### Steps

1. **Checkout code**: Uses `actions/checkout` to retrieve the code.
2. **Grant Privileges to MySQL User**: Sets up the necessary privileges for the MySQL user.
3. **Set up Node.js**: Configures Node.js using `actions/setup-node`.
4. **Install dependencies**: Runs `npm install` to install Node.js dependencies.
5. **Wait for MySQL to be ready**: Ensures that the MySQL database is up and running before proceeding.
6. **Run Unit Tests**: Executes unit tests using `npm run test:unit`.
7. **Run Integration Tests**: Executes integration tests using `npm run test:integration`.

# Packer Configuration for Golden Image Provisioning

This project uses Packer to automate the creation of a custom Amazon Machine Image (AMI) tailored for a web application. The configuration allows for efficient and consistent provisioning of server images.

## Key Components

- **Required Plugins**: Utilizes the Amazon Packer plugin to create AMIs.

- **Variables**:

  - **Source AMI Filters**: Filters for selecting the base Ubuntu AMI, including description, root device type, and virtualization type.
  - **AMI Settings**: Configuration for the AMI, including region, name, instance type, and SSH user.
  - **MySQL Configuration**: Credentials and connection details for the MySQL database.

- **Source Block**: Defines how to source the AMI using specific filters and sets permissions for other AWS accounts to access the AMI.

- **Build Block**:
  - **File Provisioners**: Copies necessary files (e.g., web application files) to the AMI.
  - **Shell Provisioner**: Runs scripts to update the system, install required software, and configure the application.
  - **Post-Processor**: Generates a manifest file for tracking the build process.

This configuration ensures that the AMI is consistently provisioned with the necessary applications and configurations, streamlining deployment and setup processes across different environments.
