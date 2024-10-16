set -e

DIR="/opt/csye6225"
NEW_USER="srishti772"
NEW_PASSWORD="testPassword!"

sudo mkdir -p "${DIR}"

echo "Creating usergroup csye6225"
sudo groupadd csye6225

echo "Creating user csye6225 and adding it to the group csye6225"
sudo useradd --system -s /usr/sbin/nologin -g csye6225 -d ${DIR} -m csye6225


echo "Copying webapp.zip to ${DIR}"
sudo cp -r webapp.zip "${DIR}"

cd "${DIR}"

echo "Unzipping webapp.zip in ${DIR}"
sudo unzip -o webapp.zip -d "${DIR}"

echo "Setting ownership for /opt/csye6225/webapp"
sudo chown -R csye6225:csye6225 "${DIR}/webapp"
cd "${DIR}/webapp"

echo "Installing npm dependencies..."
sudo -u csye6225 npm install

ENV_FILE="${DIR}/webapp/.env"
echo "Creating .env file with environment variables"
cat <<EOF | sudo tee $ENV_FILE
PORT=3000
MYSQL_USER=$NEW_USER
MYSQL_PASSWORD=$NEW_PASSWORD
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE_TEST=test_db
MYSQL_DATABASE_PROD=prod_db
EOF

echo "Verifying .env file contents:"
cat $ENV_FILE

sudo -u csye6225 npm start