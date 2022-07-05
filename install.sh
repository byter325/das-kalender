echo "Installing Node.js and npm..."
sudo apt install -y nodejs npm
echo "Cloning the repository..."
git clone https://github.com/maxomnia/pm_project_rapla.git
cd pm_project_rapla
echo "Installing dependencies..."
npm install
echo "Generating certificate..."
npm run certificate
echo "Project is now ready to use. Do you want to start it now? (y/n)"
read -r answer
case $answer in
    [yY][eE][sS]|[yY])
        echo "Starting project..."
        npm run start
        ;;
    *)
        echo "Project is not started. You can start it with 'npm run start' command."
        ;;
esac