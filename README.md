# PM Rapla Backend

## Quick start

Type

`npm run start`

and open browser at http://localhost:8080/api/getRaplaEvents/TINF21B1

## Filters

### examples

/api/getRaplaEvents/TINF21B1?from=2022-03-21T00:00:00.000Z

/api/getRaplaEvents/TINF21B1?to=2022-03-21T00:00:00.000Z

/api/getRaplaEvents/TINF21B1?from=2022-03-21T00:00:00.000Z&to=2022-04-21T00:00:00.000Z

## XML Scheme

`<events> <event> <type>VEVENT</type> <lastmodified>2022-03-16T08:00:17.000Z</lastmodified> <created>2022-01-05T12:55:27.000Z</created> <start>2022-03-21T10:00:00.000Z</start> <dtstamp>2022-03-16T08:00:17.000Z</dtstamp> <end>2022-03-21T11:00:00.000Z</end> <uid>a05c5a0d-fbf2-4974-8af1-2d103ad1e5df</uid> <summary>Klausur Intercultural Communication Intercultural Communication (60 min)</summary> <description>Klausur Intercultural Communication TINF21B1</description> <location>A266 Hörsaal</location> <categories>Prüfung</categories> <organizer> <params> <CN>"Eisenbiegler, Jörn"</CN> </params> <val>MAILTO:joern.eisenbiegler@dhbw-karlsruhe.de</val> </organizer> </event> </events>`
=======
# pm_project_rapla

Nützliches Tool für XSD-Schemata: https://sourceforge.net/projects/camprocessor/files/CAM%20Editor/Releases/3.2.2/