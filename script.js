// import dotenv as 'dotenv'

const headers = new Headers();
headers.append("x-client", "a52cd6ba-b2c4-4a6a-829e-aa407525c4aa-ics-to-habitica-tool");
headers.append("x-api-key", "a4effcb3-e090-4201-a2e8-a83cd78aee77");
headers.append("x-api-user", "a52cd6ba-b2c4-4a6a-829e-aa407525c4aa");

// const xXclientXx = process.env.USER_ID;
// const X_api_key = process.env.API_KEY;
// const uid = process.env.USER_ID;

getUserTasks();

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