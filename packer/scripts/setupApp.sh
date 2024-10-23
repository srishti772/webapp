DIR="/opt/csye6225"


echo "========================================"
echo "          Creating usergroup csye6225"
echo "========================================"
sudo groupadd csye6225

echo "========================================"
echo "Creating user csye6225 and adding it to the group csye6225"
echo "========================================"
sudo useradd --system -s /usr/sbin/nologin -g csye6225 -d ${DIR} -m csye6225

echo "========================================"
echo "Copying webapp.zip to ${DIR}"
echo "========================================"
sudo cp -r webapp.zip "${DIR}"

echo "========================================"
echo " Setting ownership for /opt/csye6225/webapp"
echo "========================================"
sudo chown -R csye6225:csye6225 "${DIR}"
sudo chmod -R 770  /opt/csye6225

sudo -u csye6225 bash <<EOF
cd "${DIR}"

echo "========================================"
echo "SHOW FILES"
echo "========================================"
ls
# Unzip as csye6225 user to ensure proper permissions
unzip -o webapp.zip -d "${DIR}/webapp"

cd "${DIR}/webapp"

echo "========================================"
echo "Checking if the file exists"
echo "========================================"
if [ -f package.json ]; then
    echo "File 'package.json' exists."
else
    echo "File 'package.json' does not exist."
fi

echo "========================================"
echo "Installing npm dependencies..."
echo "========================================"
npm install --no-audit --no-fund


EOF

#Verify ownership and permissions
echo "========================================"
echo "Showing updated permissions in /opt/csye6225"
echo "========================================"
sudo ls -la /opt/csye6225 