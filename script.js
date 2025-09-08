const { rejects } = require('assert');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const { type } = require('os');
const { resolve } = require('path');
const { promiseHooks } = require('v8');

const xXclientXx = process.env.USER_ID;
const X_api_key = process.env.API_KEY;
const uid = process.env.USER_ID;

const headers = new Headers();
headers.append("x-client", xXclientXx);
headers.append("x-api-key", X_api_key);
headers.append("x-api-user", uid);
headers.append("Content-Type", "application/json");
postUserTasks();

async function getUserTasks() {
    try {
        const res = await fetch("https://habitica.com/api/v3/tasks/user", {
            method: "GET",
            headers: headers,
        });
        const data = await res.json();
        console.log(data.data);
        if(!res.ok){
            console.error("a problem with the http request");
        }
    } catch (error) {
        console.error(error);
    }
}

async function postUserTasks() {
    try {
        // 1. Group all your task data into a single object
        const taskData = {
            "text": "Update Habitica API Documentation2 - Tasks",
            "type": "todo",
            "alias": "hab-api-tasks2",
            "notes": "Update the tasks api on GitHub",
            "date": "2025-09-28",
            "tags": [
                "ed427623-9a69-4aac-9852-13deb9c190c3"
            ],
            "checklist": [
                {
                    "text": "read wiki",
                    "completed": true
                },
                {
                    "text": "write code"
                }
            ],
            "priority": 2
        }

        const res = await fetch("https://habitica.com/api/v3/tasks/user", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(taskData)
        });

        const data = await res.json();
        console.log(data);
        console.log("Server Response:", data);
        
        if (res.ok) {
            console.log("Task created successfully!");
        } else {
            console.error("HTTP Request failed with status:", res.status);
        }

    } catch (error) {
        console.error("A critical error occurred:" + error.name + "\n" + error.message);
    }
    
}

async function getICSData(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, function (err, data) {
            if (err) {
                reject('data not readable. Check syntax. Do desk check.\n' + err);
                return console.error(err);
            }
            resolve('successfully read data!\n' + data);
        });
    });

}

// I have to put all my functions into here. It's basically main, but not main.
getICSData("all assignment due dates.ics").then((msg) => {
    // console.log(msg + "\n we have an array of data.");
    cleanedICSData = splitICSData(msg);
}).catch((error) => {
    console.log(error.name + "\n" + error.message + "\ndata not read successfully. check syntax. do desk check.");
});

// Gemini wrote this function.

async function splitICSData(data) {
    try {
        // ics data turned into a string for iteration
        const stringData = data.toString();

        // stringified data split into an array.
        const separatedEvents = stringData.split("\n");

        // This will be our final 2D array
        const allBlocks = [];
        // This will temporarily hold the lines for the block we are currently parsing
        let currentBlock = null;

        // Loop through the entire array of lines
        for (const line of separatedEvents) {
            // Trim whitespace to make matching more reliable
            const trimmedLine = line.trim();

            // Check for the start of a new block (e.g., "BEGIN:VEVENT")
            // We ignore the main "BEGIN:VCALENDAR"
            if (trimmedLine.startsWith('BEGIN:') && trimmedLine !== 'BEGIN:VCALENDAR') {
                // We found the start of a new block, so we create a new array for it
                currentBlock = [trimmedLine];
            }
            // Check for the end of a block (e.g., "END:VEVENT")
            else if (trimmedLine.startsWith('END:') && trimmedLine !== 'END:VCALENDAR') {
                // Make sure we are actually inside a block before ending it
                if (currentBlock) {
                    // Add the "END" line to the block
                    currentBlock.push(trimmedLine);
                    // Add the completed block to our final 2D array
                    allBlocks.push(currentBlock);
                    // Reset currentBlock, so we are ready for the next one
                    currentBlock = null;
                }
            }
            // If we are currently inside a block, add the line to it
            else if (currentBlock) {
                currentBlock.push(trimmedLine);
            }
        }
        
        // Return the final 2D array
        return allBlocks;

    } catch (error) {
        console.error(error.name + ":\n" + error.message);
    }
}
