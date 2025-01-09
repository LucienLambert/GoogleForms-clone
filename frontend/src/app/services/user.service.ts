import { Injectable, Inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { User } from '../models/user';
import { catchError, map } from 'rxjs/operators';
import {BehaviorSubject, Observable, of, switchMap, tap} from 'rxjs';
import { plainToInstance } from 'class-transformer';
import {OptionList} from "../models/optionList";
import {Form} from "../models/form";
import {UserFormAccess} from "../models/userFormAccess";

@Injectable({ providedIn: 'root' })
export class UserService {

    private optionListsSubject = new BehaviorSubject<OptionList[]>([]);
    public optionLists = this.optionListsSubject.asObservable();

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }


    getAll(): Observable<User[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/users`).pipe(
            map(res => plainToInstance(User, res))
        );
    }

    getUserById(userId: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}api/users/${userId}`);
    }

    getUserOptionLists(userId: number): void {
        this.http.get<Array<OptionList>>(`${this.baseUrl}api/users/optionListsWithNotReferenced/${userId}`).pipe(
            map((data) => {
                this.optionListsSubject.next(data); 
            }),
            catchError((error) => {
                console.error(error);
                this.optionListsSubject.next([]);
                return of([]);
            })
        ).subscribe();
    }

    getUserOptionList(optionListId: number): Observable<OptionList> {
        if (this.optionLists) {
            return this.optionLists.pipe(
                map((data) => data.find(optionList => optionList.id === optionListId)),
                switchMap((cachedOptionList) => {
                    if (cachedOptionList) {
                        // Cache hit: return the cached data
                        return of(cachedOptionList);
                    } else {
                        // Cache miss: fetch data from the server
                        console.log("Cache miss, fetching from server");
                        return this.http.get<OptionList>(`${this.baseUrl}api/users/optionList/${optionListId}`);
                    }
                })
            );
        }

        // Cache not initialized, fetch directly from the server
        console.log("Cache not initialized, fetching from server");
        return this.http.get<OptionList>(`${this.baseUrl}api/users/optionList/${optionListId}`);
    }

    deleteOptionList(optionListId: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.baseUrl}api/users/deleteOptionList/${optionListId}`);
    }

    deleteOptionValues(optionListIds: number[]): Observable<boolean> {
        return this.http.delete<boolean>(`${this.baseUrl}api/users/deleteOptionValues/${optionListIds}`);
    }

    createOptionList(optionList: OptionList): Observable<OptionList> {
        return this.http.post<OptionList>(`${this.baseUrl}api/users/createOptionList`, optionList)
            .pipe(map(res => new OptionList(res)));
    }

    updateOptionList(optionList: OptionList): Observable<OptionList> {
        return this.http.put<OptionList>(`${this.baseUrl}api/users/updateOptionList`, optionList)
            .pipe(map(res => new OptionList(res)));
    }

    saveOptionList(optionList: OptionList): Observable<OptionList> {
        if (optionList.id != 0) {
            return this.updateOptionList(optionList);
        } else {
            return this.createOptionList(optionList);
        }
    }
    getAllWithFormAccess(formId: number): Observable<User[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/users/all/with_form_accesses/${formId}`).pipe(
            map((res: any[]) => res.map(user => new User(user)))
        );
    }

    // UserFormAccess, il y a peu de méthodes
    updateUserFormAccess(formAccess : UserFormAccess): Observable<boolean> {
        return this.http.put<boolean>(`${this.baseUrl}api/UserFormAccesses`, formAccess);
    }
    deleteUserFormAccess(formAccess: UserFormAccess): Observable<boolean> {
        return this.http.delete<boolean>(`${this.baseUrl}api/UserFormAccesses/${formAccess.formId}/${formAccess.userId}`);
    }

    isEmailUnique(email: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}api/Users/unicity/email/?email=${email}`);
    }
    areNamesUnique(names: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}api/Users/unicity/names/?names=${names}`);
    }
}
