const { rejects } = require('assert');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const { type } = require('os');
const { resolve } = require('path');
const { promiseHooks } = require('v8');

const X_api_key = process.env.API_KEY;
const uid = process.env.USER_ID;
// Per API guidelines, create a descriptive client ID.
const clientId = `${uid}-ics-to-habitica-tool`;

const headers = new Headers();
headers.append("x-client", clientId);
headers.append("x-api-key", X_api_key);
headers.append("x-api-user", uid);
headers.append("Content-Type", "application/json");

/**
 * Parses the 2D array of ICS event blocks into a clean array of Habitica task objects.
 * @param {string[][]} cleanedICSData - The 2D array where each inner array is an event block.
 * @returns {object[]} An array of objects formatted for the Habitica API.
 */
function slimICSData(cleanedICSData) {
    const habiticaTasks = [];
    const physicsKeywords = ['Lesson', 'Block', 'preflight', 'MSE'];
    const eceKeywords = ['Quiz', 'HW', 'Project', 'Lab', 'Homework'];

    for (const eventBlock of cleanedICSData) {
        let summary = '';
        let date = '';

        for (const line of eventBlock) {
            if (line.startsWith('SUMMARY:')) {
                summary = line.substring(8).trim();
            } else if (line.startsWith('DTSTART')) {
                // Extracts the date part (e.g., 20250928) from the line
                const dateTimeString = line.split(':')[1];
                const yyyymmdd = dateTimeString.substring(0, 8);
                
                // Formats YYYYMMDD into YYYY-MM-DD
                const year = yyyymmdd.substring(0, 4);
                const month = yyyymmdd.substring(4, 6);
                const day = yyyymmdd.substring(6, 8);
                date = `${year}-${month}-${day}`;
            }
        }

        // Add class suffixes to the summary based on keywords
        if (physicsKeywords.some(kw => summary.startsWith(kw))) {
            summary += ' - Physics';
        } else if (eceKeywords.some(kw => summary.startsWith(kw))) {
            summary += ' - ECE';
        }

        // Only add the task if we successfully found a summary and a date
        if (summary && date) {
            habiticaTasks.push({
                text: summary,
                type: 'todo',
                date: date,
            });
        }
    }
    return habiticaTasks;
}


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

/**
 * Posts an array of task objects to the Habitica API, one by one.
 * @param {object[]} tasksToPost - An array of formatted Habitica task objects.
 */
async function postAllTasks(tasksToPost) {
    console.log(`Preparing to post ${tasksToPost.length} tasks to Habitica...`);
    for (const taskData of tasksToPost) {
        try {
            const res = await fetch("https://habitica.com/api/v3/tasks/user", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(taskData)
            });

            const data = await res.json();
            
            if (res.ok) {
                console.log(`SUCCESS: Task "${taskData.text}" created successfully!`);
            } else {
                console.error(`FAILED: Could not create task "${taskData.text}". Status: ${res.status}`);
                console.error('Server Response:', data.message);
            }

            // MODIFIED: Increased delay to 2 seconds (2000ms) to comply with the 30 requests/minute limit.
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`CRITICAL ERROR while posting task "${taskData.text}":`, error);
        }
    }
    console.log("Finished posting all tasks.");
}

async function getICSData(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, function (err, data) {
            if (err) {
                reject('data not readable. Check syntax. Do desk check.\n' + err);
                return console.error(err);
            }
            resolve(data);
        });
    });
}

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

// Main execution block
async function main() {
    try {
        console.log("Reading ICS file...");
        const rawICSData = await getICSData("all assignment due dates.ics");
        console.log("Splitting ICS data into blocks...");
        const cleanedICSData = await splitICSData(rawICSData);
        console.log(`Found ${cleanedICSData.length} events.`);
        console.log("Formatting events for Habitica...");
        const tasksForHabitica = slimICSData(cleanedICSData);
        await postAllTasks(tasksForHabitica);
    } catch (error) {
        console.log("An error occurred in the main process:", error);
    }
}

// Run the main function
main();