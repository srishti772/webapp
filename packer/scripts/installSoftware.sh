set -e
export DEBIAN_FRONTEND="noninteractive"

# Variables
DIR="/opt/csye6225"
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

sudo mkdir -p "${DIR}"

echo "========================================"
echo "          Creating usergroup csye6225"
echo "========================================"
sudo groupadd csye6225

echo "========================================"
echo "Creating user csye6225 and adding it to the group csye6225"
echo "========================================"
sudo useradd --system -s /usr/sbin/nologin -g csye6225 -d ${DIR} -m csye6225

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
echo "Copying webapp.zip to ${DIR}"
echo "========================================"
sudo cp -r webapp.zip "${DIR}"

cd "${DIR}"

echo "========================================"
echo " Unzipping webapp.zip in ${DIR}/webapp"
echo "========================================"
sudo unzip -o webapp.zip -d "${DIR}/webapp"

cd "${DIR}/webapp"

echo "========================================"
echo "          Checking if the file exists"
echo "========================================"
if ls | grep -q package.json; then
    echo "File 'package.json' exists."
else
    echo "File 'package.json' does not exist."
fi

echo "========================================"
echo "          Installing npm dependencies..."
echo "========================================"
sudo npm install

ENV_FILE="${DIR}/webapp/.env"
echo "========================================"
echo "          Creating .env file with environment variables"
echo "========================================"
cat <<EOF | sudo tee $ENV_FILE
PORT=$PORT
MYSQL_USER=$NEW_USER
MYSQL_PASSWORD=$NEW_PASSWORD
MYSQL_HOST=$MYSQL_HOST
MYSQL_PORT=$MYSQL_PORT
MYSQL_DATABASE_TEST=$MYSQL_DATABASE_TEST
MYSQL_DATABASE_PROD=$MYSQL_DATABASE_PROD
EOF

echo "========================================"
echo "          Verifying .env file contents:"
echo "========================================"
cat $ENV_FILE

#echo "========================================"
#echo "          Starting the application..."
#echo "========================================"
#sudo npm start


echo "========================================"
echo " SystemD Setup"
echo "========================================"
cd ~
sudo cp -r webapp.service "/etc/systemd/system/webapp.service"
sudo systemctl daemon-reload
sudo systemctl enable webapp.service


echo "========================================"
echo " Setting ownership for /opt/csye6225/webapp"
echo "========================================"
sudo chown -R csye6225:csye6225 "${DIR}/webapp"
sudo chmod -R 750  /opt/csye6225/webapp

echo "========================================"
echo "Showing updated permissions"
echo "========================================"
ls -la /opt/csye6225 | grep 'csye6225'

