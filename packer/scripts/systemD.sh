
echo "========================================"
echo " SystemD Setup"
echo "========================================"
cd ~
sudo cp -r webapp.service "/etc/systemd/system/webapp.service"
sudo systemctl daemon-reload
sudo systemctl enable webapp.service
