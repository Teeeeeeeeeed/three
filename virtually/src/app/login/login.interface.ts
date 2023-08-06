export interface UserLogin {
    email: string;
    password: string;
}

export interface User {
    userId: string;
    firstName: string;
    lastName:string;
    email: string;
}

export interface UserInfo extends User{
    password: string;
}