import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string;
  private isAuthenticated = false;
  private authStatusListner = new Subject<boolean>();
  private tokenTimer: any;
  private userId: string;
  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }
  getIsAuth() {
    return this.isAuthenticated;
  }
  getUserId() {
    return this.userId;
  }
  getAuthStatusListner() {
    return this.authStatusListner.asObservable();
  }
  createUser(email: string, password: string) {
    const authdata: AuthData = { email: email, password: password };
    this.http.post('http://localhost:3000/api/user/signup', authdata)
      .subscribe(response => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListner.next(false);
      });
  }
  loginUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password }
    this.http
      .post<{ token: string, expireIn: number, userId: string }>(
        'http://localhost:3000/api/user/login'
        , authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        const expireInDuration = 3600;
        if (token) {
          this.tokenTimer = setTimeout(() => {
            this.logout();
          }, expireInDuration * 1000);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListner.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expireInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListner.next(false);
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    this.userId = authInformation.userId;
    console.log(authInformation, expiresIn);
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.tokenTimer = setTimeout(() => {
        this.logout();
      }, expiresIn);
      this.authStatusListner.next(true);

    }
  }
  getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId
    };
  }
  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }
}
