console.log("Hi");
test();
// test().then((data) => {
//     console.log(data);
//     return data;
// }).catch((err) => {
//     console.error(err);
    
// });
async function test() {
    const res = await fetch(`https://habitica.com/api/v4/admin/username/user-id/history`);
    const data = await res.json();
    console.log(data);
    // return data;
}