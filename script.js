const { rejects } = require('assert');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
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
// postUserTasks();

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
            "text": "Update Habitica API Documentation1 - Tasks",
            "type": "todo",
            "alias": "hab-api-tasks1",
            "notes": "Update the tasks api on GitHub",
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
        const result = await res.json();
        console.log("Server Response:", result);
        
        if (response.ok) {
            console.log("Task created successfully!");
        } else {
            console.error("HTTP Request failed with status:", response.status);
        }

    } catch (error) {
        console.error("A critical error occurred:", error);
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
    console.log(splitICSData(msg));
}).catch((error) => {
    console.log(error.name + "\n" + error.message + "\ndata not read successfully. check syntax. do desk check.");
});

console.log(splitICSData(getICSData("all assignment due dates.ics")) + "\n splitting data");

async function splitICSData(data){
    try {
        // ics data turned into a string for iteration
        stringData = data.toString();
    
        // stringified data split into an array.
        let separatedEvents = stringData.split("\n");
        return separatedEvents;
        
    } catch (error) {
        console.error(error.name + ":\n" + error.message);
    }
    
}
