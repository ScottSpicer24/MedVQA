import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

export interface HFEndpointStatus {
  status: string;                        // 'running' | 'scaledToZero' | …
  deployment: { current_replica_count: number };
}

@Injectable({
  providedIn: 'root'
})
export class EndpointServices {
  namespace = "scottspicer24";
  name = "medllava-ft"
  url = "https://y3y4q9sxi6y80ss0.us-east-1.aws.endpoints.huggingface.cloud"
  constructor(private http: HttpClient) {}
  header = new HttpHeaders({})
  
  /** GET  **/
  getStatus(): Observable<any> {
    return this.http.get(this.url, {
        observe: 'response',           // 🌟 full HttpResponse
        responseType: 'text'           // body is plain text, not JSON
      }).pipe(
        tap(resp => console.log('raw response:', resp)),   // see everything
        map(resp => resp.status),             // successful 2xx
        catchError((err: HttpErrorResponse) => {
          // treat certain errors as valid states
          return [400, 503].includes(err.status)
            ? of(err.status)
            : throwError(() => err);                       // bubble others
        })
      );
  }

  /** POST …/inference-endpoints/{ns}/{name}:resume  */
  wakeUp(): Observable<unknown> {
    const url =
      `https://api.endpoints.huggingface.cloud/v1/inference-endpoints/` +
      `${this.namespace}/${this.name}:resume`;
    return this.http.post(url, {}, {});
  }
}
