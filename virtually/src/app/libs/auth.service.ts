import { Injectable } from "@angular/core";
import { MockAuthEndPointService } from "../login/auth-endpoint.service";
import { UserInfo, UserLogin } from "../login/login.interface";
import {MatSnackBar} from '@angular/material/snack-bar';
import { Observable } from "rxjs";

@Injectable({providedIn:'root'})
export class MockAuthService {
    private isLoggedIn = false;
    
    constructor(private readonly endpoint: MockAuthEndPointService, private readonly snackbar: MatSnackBar) {}

    // TODO improve mock calls to be able to do HTTP error codes

    // TODO make snack bar service
    async login(user: UserLogin) {
        const u = await this.endpoint.mockLoginCall(user);
        if (u) {
            this.snackbar.open('Login Successful!')
        } else {
            this.snackbar.open('Login Failed', 'OK', {
                duration:2500,
                panelClass:['red-snackbar']
            })
        }
        this.isLoggedIn = !!u;
        return u; 
    }

    async register(user: UserInfo){
        const u = await this.endpoint.mockRegisterCall(user).catch( e => {
            this.snackbar.open('Registration Failed', 'OK', {
                duration:2500,
                announcementMessage:e.message,
                panelClass:['red-snackbar']
            })
        });
        this.snackbar.open('Registration Successful!', 'OK', {
            duration:2500,
            panelClass: ['green-snackbar']
        })
        this.isLoggedIn = !!u;
        return u;
    }

    isAuthenticated(): boolean {
        return this.isLoggedIn
    }
}