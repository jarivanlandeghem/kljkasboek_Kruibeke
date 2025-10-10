# Uitleg backend

API REQUEST SOORTEN:
GET: Read - data opvragen
POST: Create - nieuwe data toevoegen
PUT: Update - data aanpassen
DELETE: Delete - data verwijderen

VERSIE:
MAJOR.MINOR.PATCH, elke deel wordt met één verhoogd in volgende gevallen:

MAJOR: wijzigingen die niet compatibel zijn met oudere versies
MINOR: wijzigen die wel compatibel zijn met oudere versies
PATCH: kleine bugfixes (compatibel met oudere versies)

STARTCOMMANDOS:
start: start de applicatie (zonder debugging of hot reloading)
start:dev: start de applicatie in development modus (met hot reloading)
start:debug: start de applicatie in debug modus
start:prod: start de applicatie in productie modus

STRUCTUUR NESTJS PROJECT:
<https://docs.nestjs.com/first-steps>

HEALTH CONTROLLER:
Een Health Controller (of health check endpoint) is een eenvoudige route in je backend (zoals /health of /status) die dient om te controleren of je server nog correct draait.

src/health/health.controller.ts: de controller zelf
src/health/health.controller.spec.ts: unit test bestand voor de controller

DEBUGGER:
Dit zorgt ervoor dat VS Code de debugger zal koppelen aan localhost:9229. Indien de debugger om een of andere reden ontkoppeld wordt, zal VS Code proberen opnieuw te koppelen voor maximaal 10 seconden.

Voor NestJS hoef je geen extra opties toe te voegen aan het start-commando. NestJS heeft standaard debugging ondersteuning ingebouwd.

Start je applicatie in debug modus met pnpm start:debug. Vervolgens kan je in VS Code debugger starten door op het play-icoontje (naast 'Attach to NestJS server') te klikken in de debug tab:
