import dotenv from 'dotenv'

xXclientXx = process.env.USER_ID;
X_api_key = process.env.API_KEY;
uid = process.env.USER_ID;
console.log("Hi");
test();
// test().then((data) => {
//     console.log(data);
//     return data;
// }).catch((err) => {
//     console.error(err);
    
// });
async function test() {
    try {
        const xXclientXx = new Headers();
        xXclientXx.append("X_Client",  );
        const res = await fetch(`https://habitica.com/api/v3/tasks/The_Great_Saiyenmam`, {
            method: "GET",
            headers: {
                "x-client": "l",
                "x-api-key": "a",
                "x-api-user": "aa",
            }
        });
        const data = await res.json();
        console.log(data);
        // return data;
        
    } catch (error) {
        // error = data.error;
        // let errorMessage = data.message;
        // console.error(`${error}:\n${errorMessage}`);
        console.error(error);
    }
}