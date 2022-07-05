# PM Rapla Backend

## Installation
You have to install Node.js and npm first:

On Ubuntu/Debian: `sudo apt install -y nodejs npm` \
On Arch: `sudo pacman -S nodejs npm` \
On MacOS: `brew install node`\
On Windows, you need to download and execute the installer from the [NodeJS](https://nodejs.org/en/download/) website.

```bash
git clone https://github.com/maxomnia/pm_project_rapla.git
cd pm_project_rapla
npm install
npm run certificate
npm run start
```

The webUI is available at https://localhost:8080/. \
The API documentation is available at https://localhost:8080/docs.

## Security

Because of HTTPS you must have a self signed certificate / signed certificate and place it into the `security` folder with the key named `server.key` and the certificate `server.cert`

A self signed certificate can be created using openssl and the following command:

`openssl req -nodes -new -x509 -keyout security/server.key -out security/server.cert -keyout security/server.key`

or run:

`npm run certificate`

=======

# pm_project_rapla

Nützliches Tool für XML-Schemata: https://sourceforge.net/projects/camprocessor/files/CAM%20Editor/Releases/3.2.2/
