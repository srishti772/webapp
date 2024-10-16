set -e
export DEBIAN_FRONTEND="noninteractive"

# Variables
ROOT_PASSWORD="testPassword!"  
NEW_USER="srishti772"
NEW_PASSWORD="testPassword!"
DATABASE1="test_db"
DATABASE2="prod_db"

# Environment Variables
PORT=3000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE_TEST="test_db"
MYSQL_DATABASE_PROD="prod_db"


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

# Install MySQL
echo "========================================"
echo "Installing MySQL server..."
echo "========================================"
sudo apt install -y mysql-server
sudo systemctl start mysql.service
echo "MySQL service status:"

# Run SQL commands to configure MySQL
sudo mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$ROOT_PASSWORD';
FLUSH PRIVILEGES;
EOF

# Run SQL commands to create user and databases
echo "Creating MySQL user and databases..."
sudo mysql -u root -p"$ROOT_PASSWORD" <<EOF
CREATE USER '$NEW_USER'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
GRANT ALL PRIVILEGES ON *.* TO '$NEW_USER'@'localhost' WITH GRANT OPTION;
CREATE DATABASE $DATABASE1;
CREATE DATABASE $DATABASE2;
FLUSH PRIVILEGES;
EOF

echo "========================================"
echo " Remove GIT if exists"
echo "========================================"
sudo apt remove -y git


echo "========================================"
echo " SystemD Setup"
echo "========================================"
cd ~
sudo cp -r webapp.service "/etc/systemd/system/webapp.service"
sudo systemctl daemon-reload
sudo systemctl enable webapp.service


