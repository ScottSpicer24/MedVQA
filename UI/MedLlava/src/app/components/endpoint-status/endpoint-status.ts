import { ChangeDetectorRef, Component } from '@angular/core';
import { switchMap, takeWhile, tap, timer } from 'rxjs';
import { EndpointServices } from '../../services/endpoint-services';
import { Heartbeat } from '../heartbeat/heartbeat';
import { Flatline } from '../flatline/flatline';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-endpoint-status',
  imports: [Heartbeat, Flatline, MatButtonModule],
  templateUrl: './endpoint-status.html',
  styleUrl: './endpoint-status.scss'
})
export class EndpointStatus {
  state = 400;

  constructor(private svc: EndpointServices, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    timer(0, 3000).pipe(
          switchMap(() => this.svc.getStatus()),      // Observable<number>
          tap(code => {
            console.log('Endpoint status:', code);    // see the whole response
            this.state = code;
            this.cdr.detectChanges();
          }),
          takeWhile(code => code === 503, true)       // true = include first non‑503
        )
        .subscribe(); 
  }

  refresh() {
    this.svc.getStatus().subscribe(res => {
      console.log('Endpoint status:', res);
      this.state = res;
      this.cdr.detectChanges();
    });
  }
}

