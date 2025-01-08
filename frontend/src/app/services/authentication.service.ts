import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';
import { User } from '../models/user';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import {jwtDecode} from "jwt-decode";

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    // l'utilisateur couramment connecté (undefined sinon)
    public currentUser?: User;

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
        // au départ on récupère un éventuel utilisateur stocké dans le sessionStorage
        let data = sessionStorage.getItem('currentUser');
        if (data) {
            data = JSON.parse(data);
            this.currentUser = new User(data);
        }
    }

    login(email: string, password: string): Observable<User> {
        return this.http.post<any>(`${this.baseUrl}api/users/authenticate`, { email, password })
            .pipe(map(user => {
                user = new User(user);
                // user = plainToClass(User, user);
                console.log(user);
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    console.log("token exists, saving user",user.token);
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUser = user;
                }

                return user;
            }));
    }
    getLoggedUser() : Observable<User>{
        // logged user from the backend
        return this.http.get<any>(`${this.baseUrl}api/logged_user`).pipe()
    }

    logout() {
        // remove user from local storage to log user out
        sessionStorage.removeItem('currentUser');
        this.currentUser = undefined;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getRoleFromToken(): string | undefined {
        const currentUser = sessionStorage.getItem('currentUser'); // Retrieve the stored user object
        if (!currentUser) {
            return undefined;
        }

        try {
            const parsedUser = JSON.parse(currentUser); // Parse the stored JSON
            const token = parsedUser.token; // Extract the token

            if (!token) {
                return undefined;
            }

            // Decode the token
            const decodedToken: any = jwtDecode(token);

            // Extract the role
            return decodedToken.role || undefined; // Adjust based on the actual key name in your token
        } catch (error) {
            console.error('Error decoding token:', error);
            return undefined;
        }
    }

    getUserIdFromToken(): number | undefined {
        const currentUser = sessionStorage.getItem('currentUser'); // Retrieve the stored user object
        if (!currentUser) {
            return undefined;
        }

        try {
            const parsedUser = JSON.parse(currentUser); // Parse the stored JSON
            const token = parsedUser.token; // Extract the token

            if (!token) {
                return undefined;
            }

            // Decode the token
            const decodedToken: any = jwtDecode(token);

            console.log("hello : " + decodedToken.nameid);
            // Extract the role
            return Number(decodedToken.nameid) || undefined; // Adjust based on the actual key name in your token
        } catch (error) {
            console.error('Error decoding token:', error);
            return undefined;
        }
    }
}
