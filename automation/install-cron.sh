#!/bin/bash
# Zet het schema van de news agent op 6 runs per dag.
# Draai dit zelf in je terminal: macOS staat niet toe dat een ander proces
# de crontab aanpast zonder Full Disk Access.
cd "$(dirname "$0")" && crontab crontab.txt && echo "Schema geinstalleerd:" && crontab -l
