#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Activate the virtual environment
if [ -d "wslenv" ]; then
  source wslenv/bin/activate
else
  echo "Error: Virtual environment 'wslenv' not found."
  exit 1
fi

# Default Gunicorn settings
HOST="0.0.0.0"
PORT="9020"
#WORKERS=$(( 2 * $(nproc) + 1 ))
#THREADS=4
WORKERS=1  
THREADS=1  
TIMEOUT=120

# Run Gunicorn
exec gunicorn \
  --bind "$HOST:$PORT" \
  --workers "$WORKERS" \
  --threads "$THREADS" \
  --timeout "$TIMEOUT" \
  --access-logfile "-" \
  --error-logfile "-" \
  server_v5:app