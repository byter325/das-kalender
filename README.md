![](/app/banner.png)

# das kalendar [![CodeQL](https://github.com/maxomnia/pm_project_rapla/actions/workflows/codeql.yml/badge.svg)](https://github.com/maxomnia/pm_project_rapla/actions/workflows/codeql.yml)

## A quick overview
Before starting, our team wants to quickly thank you for choosing **das kalender** as your calendar software of choice. 

This guide is supposed to help you install and run the **das kalender** web-based application for the first time and the times after that.
This guide also contains more information about the software like information concerning the security.

## Installing and Running
You have to install Node.js and npm first:

On Ubuntu/Debian: `sudo apt install -y nodejs npm` \
On Arch: `sudo pacman -S nodejs npm` \
On MacOS: `brew install node`\
On Windows, you need to download and execute the installer from the [NodeJS](https://nodejs.org/en/download/) website.

After installing NodeJS, you need to run the following commands in a terminal:
```bash
git clone https://github.com/maxomnia/pm_project_rapla.git
cd pm_project_rapla
npm install
npm run certificate
```

Congratulations! You have finished the installation process and can now run the application for the first time.

### The first launch

If you have not closed the terminal yet, you can just execute `npm start`. Otherwise proceed to *Relaunching the application*

Now you will be able to visit the web-based calendar interface at https://localhost:8080/

### Relaunching the application
To relaunch the "das kalender" application, you will need to run the following commands
```bash
cd <your_path>
npm start
```
`<your_path>` needs to be replaced with the main directory of the application titled something like `C:/.../pm_project_rapla`

Now you will be able to visit the web-based calendar interface at https://localhost:8080/

## Security

Because of HTTPS you must have a self signed certificate / signed certificate and place it into the `security` folder with the key named `server.key` and the certificate `server.cert`

A self signed certificate can be created using openssl and the following command:

`openssl req -nodes -new -x509 -keyout security/server.key -out security/server.cert -keyout security/server.key`

or run:

`npm run certificate`

## Misc
The API documentation is available at https://localhost:8080/docs.
