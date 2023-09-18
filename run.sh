#!/bin/bash

while true; do
    # Run index.js
    echo "Starting index.js..."
    node buy.js

    # Check if index.js exited successfully (exit code 0)
    if [ $? -eq 0 ]; then
        echo "buy.js completed successfully."
    else
        echo "buy.js crashed. Restarting..."

        # Wait for a moment before restarting
        sleep 10
        continue
    fi

    # Wait for 20 minutes
    echo "Waiting for 20 minutes..."
    sleep 1200

    # Run clear_subjects.js
    echo "Starting clear_subjects.js..."
    node clear_subjects.js

    # Check if clear_subjects.js exited successfully (exit code 0)
    if [ $? -eq 0 ]; then
        echo "clear_subjects.js completed successfully."
    else
        echo "clear_subjects.js crashed. Restarting..."

        # Wait for a moment before restarting
        sleep 10
        continue
    fi

    # Wait for 20 minutes
    echo "Waiting for 20 minutes..."
    sleep 1200

    # Run sell.js
    echo "Starting sell.js..."
    node sell.js

    # Check if sell.js exited successfully (exit code 0)
    if [ $? -eq 0 ]; then
        echo "sell.js completed successfully."
    else
        echo "sell.js crashed. Restarting..."

        # Wait for a moment before restarting
        sleep 10
    fi
done

