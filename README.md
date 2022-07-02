# PM Rapla Backend

## Quick start

Type

`npm start`

and open browser at https://localhost:8080/

## Filters


## Security

Because of HTTPS you must have a self signed certificate / signed certificate and place it into the `security` folder with the key named `server.key` and the certificate `server.cert`

A self signed certificate can be created using openssl and the following command:

`openssl req -nodes -new -x509 -keyout security/server.key -out security/server.cert -keyout security/server.key`

or run:

`npm certificate`

## API Examples

/api/getRaplaEvents/TINF21B1?from=2022-03-21T00:00:00.000Z

/api/getRaplaEvents/TINF21B1?to=2022-03-21T00:00:00.000Z

/api/getRaplaEvents/TINF21B1?from=2022-03-21T00:00:00.000Z&to=2022-04-21T00:00:00.000Z

=======

# pm_project_rapla

Nützliches Tool für XML-Schemata: https://sourceforge.net/projects/camprocessor/files/CAM%20Editor/Releases/3.2.2/
