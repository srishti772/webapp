set -e
export DEBIAN_FRONTEND="noninteractive"


# Echo the values of environment variables
echo "========================================"
echo "Environment Variables"
echo "----------------------------------------"
echo "NEW_USER: ${NEW_USER}"
echo "NEW_PASSWORD: ${NEW_PASSWORD}"
echo "MYSQL_HOST: ${MYSQL_HOST}"
echo "MYSQL_PORT: ${MYSQL_PORT}"
echo "APP_PORT: ${PORT}"
echo "ROOT_PASSWORD: $ROOT_PASSWORD"
echo "MYSQL_DATABASE_TEST: $MYSQL_DATABASE_TEST"
echo "MYSQL_DATABASE_PROD: $MYSQL_DATABASE_PROD"
echo "========================================"

# Install Unzip
echo "Installing unzip..."
sudo apt update
sudo apt install -y unzip

# Install Node.js
echo "========================================"
echo "Installing Node.js..."
echo "========================================"
curl -sL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
sudo bash /tmp/nodesource_setup.sh
sudo apt install nodejs -y
node -v
npm -v

