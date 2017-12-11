// Mongo

import * as bcrypt from 'bcrypt';
// import { MongoClient } from 'mongodb';

// type User = {
//     username: string,
//     password: string,
// };

// const url = 'mongodb://localhost/unsuper';
// const main = async () => {
//     const db = await MongoClient.connect(url);

//     const login = async (user: User) => {
//         const databaseEntry = await db.collection('user').findOne(
//             { username: user.username }, { fields: { password: true } });
//         console.log('databaseEntry', databaseEntry);
//         if (databaseEntry !== null &&
//             await bcrypt.compare(user.password, databaseEntry.password)) {
//             return true;
//         } else {
//             return false;
//         }
//     };
//     const register = async (user: User) => {
//         const userEntry =
//             await db.collection('user').findOne({ username: user.username });

//         if (userEntry === null) {
//             const saltRounds = 14;
//             const passwordHash = await bcrypt.hash(user.password, saltRounds);
//             await db.collection('user').insertOne(
//                 { username: user.username, password: passwordHash });
//             return true;
//         } else {
//             return false;
//         }
//     };

//     const userObj: User = { username: 'eiei3', password: 'gum' };

//     console.log('login', await login(userObj));
//     console.log('register', await register(userObj));

// };

// main().catch((reason: any) => {
//     console.log(reason);
// });

// Bcrypt

import { hasBasename } from "history/PathUtils";

const mainx = async () => {
    const password = "test";
    const password2 = "test2";
    const saltRounds = 13;
    console.time("hash");
    const hash = await bcrypt.hash(password, saltRounds);
    console.timeEnd("hash");

    console.log(hash);

    console.time("cmp");
    const result = await Promise.all([bcrypt.compare(password, hash)]);
    console.timeEnd("cmp");

    console.log(result);
};

mainx().then(() => {
    console.log("done");
});
