// import dotenv as 'dotenv'

const headers = new Headers();
headers.append("x-client", "a52cd6ba-b2c4-4a6a-829e-aa407525c4aa-ics-to-habitica-tool");
headers.append("x-api-key", "a4effcb3-e090-4201-a2e8-a83cd78aee77");
headers.append("x-api-user", "a52cd6ba-b2c4-4a6a-829e-aa407525c4aa");

// const xXclientXx = process.env.USER_ID;
// const X_api_key = process.env.API_KEY;
// const uid = process.env.USER_ID;

console.log("Hi");
test();

async function test() {
    try {

        const res = await fetch("https://habitica.com/api/v3/tasks/the_Great_Saiyenmam ", {
            method: "GET",
            headers: headers,

        });
        if(!res.ok){
            console.error("you can't get the user's tasks.");
        }
        const data = await res.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

async function getUserProfile() {
  try {
    const response = await fetch("https://habitica.com/api/v3/the_Great_Saiyenmam", {
      method: "GET",
      headers: headers,
      
    });

    if (!response.ok) {
      // If the response is not successful, throw an error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched user data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

// Call the function to run it
// getUserProfile();