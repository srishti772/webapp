set -e
export DEBIAN_FRONTEND="noninteractive"



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


echo "========================================"
echo "Installing CloudWatch Agent..."
echo "========================================"

echo 'Downloading the CloudWatch Agent package...'
sudo apt-get install -y wget
sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
 
echo 'Downloading the CloudWatch Agent package...'
sudo apt-get install -y wget
sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

echo 'Installing the CloudWatch Agent package...'
sudo dpkg -i amazon-cloudwatch-agent.deb


# Enable and start the CloudWatch Agent
sudo systemctl enable amazon-cloudwatch-agent
sudo systemctl start amazon-cloudwatch-agent


echo "Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/
aws --version

# Install jq
echo "Installing jq..."
sudo apt-get update
sudo apt-get install -y jq
jq --version