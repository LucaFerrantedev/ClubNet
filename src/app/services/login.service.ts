import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  url = "https://localhost:7061/api/login";

  constructor(private httpClient:HttpClient) {}

  Login(obj:any){
    return this.httpClient.post(this.url + "/Login",obj);
  }

  Register(obj:any){
    return this.httpClient.post(this.url + "/Register",obj);
  }
}
