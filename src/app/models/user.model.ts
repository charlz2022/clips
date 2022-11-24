export default interface IUser {
    email: string,
    // This is declared as optional (?) to match the collection w/ no error.
    password?: string, 
    name: string,
    age: number,
    phoneNumber: number
}

// Either class / interface can be use as a Model
// but do not use classes if you don't have to
// create methods inside it.
// 
// export default class IUser {
//     email?: string
//     password?: string
//     name?: string
//     age?: number
//     phoneNumber?: number
// }