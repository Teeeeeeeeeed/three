import { Injectable } from "@angular/core";
import { User, UserInfo, UserLogin } from "./login.interface";

// Mock Service made to emulate http requests to a BE.
// Timeout used to simulate delay in http
@Injectable({providedIn: 'root'})
export class MockAuthEndPointService {
    mockDb = new Map<string, UserInfo>();

    mockLoginCall(user: UserLogin): Promise<User> {
        return new Promise((resolve, reject) => {
            const u = this.mockDb.get(user.email);
            setTimeout(() => {
                if (u){
                    resolve(this.userInfoToUser(u))
                } else {
                    reject('Email or password is incorrect')
                }
            }, 1000)
        })
    }

    mockRegisterCall(user: UserInfo): Promise<User> {
        return new Promise((resolve, reject) => {
            const u = this.mockDb.get(user.email);
            setTimeout(() => {
                if(u){
                    reject('Email already in use')
                } else {
                    this.mockDb.set(user.email, user);
                    resolve(this.userInfoToUser(user));
                }
            },1000)
        })
    }

    private userInfoToUser(user: UserInfo): User {
        const { password: _password, ...u } = user;
        return u;
    }
}