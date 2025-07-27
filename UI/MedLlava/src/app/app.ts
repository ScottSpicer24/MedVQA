import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { delay, Observable, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Heartbeat } from './components/heartbeat/heartbeat';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout'

interface Input {
    image: string | null,
    question: string | null,
    a: string | null,
    b: string | null,
    c: string | null,
    d: string | null,
}

interface ModelResponse {
  response : string
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DragDropModule, MatIconModule, FormsModule, Heartbeat],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit  {
  protected readonly title = signal('MedLlava');
  private apiURL = "https://y3y4q9sxi6y80ss0.us-east-1.aws.endpoints.huggingface.cloud"
  private testURL = "https://httpbin.org/"

  input: Input = {
    image: null,
    question: null,
    a: null,
    b: null,
    c: null,
    d: null,
  }
  handset: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient, private responsive: BreakpointObserver){
    console.log('HandsetPortrait ' + Breakpoints.HandsetPortrait);
  }
  
  ngOnInit() {
    this.responsive.observe(Breakpoints.HandsetPortrait)
      .subscribe(result => {
        if (result.matches) {
          console.log("screens matches HandsetPortrait");
          this.handset = true;
        }
        else{
          console.log("screens DOES NOT match HandsetPortrait");
        }
      });  
  }

  // holds the base‑64 data‑URL for preview
  imageSrc: string | null = null;
  // keep the File around if you need to POST later
  selectedFile?: File;
  imageUploaded: boolean = false

  // Store answer
  answer = '';
  showAnswer = false;

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) { return; }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      input.value = '';              // reset chooser
      return;
    }

    this.selectedFile = file;

    /* create a preview */
    const reader = new FileReader();

    reader.onload = () => {
      console.log("pls work.")
      this.imageSrc = reader.result as string; // base‑64 string
      console.log(this.imageSrc);

      this.imageUploaded = true;
      console.log(this.imageUploaded);

      delay(1000);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  /** let user pick another image */
  resetImage() {
    this.imageUploaded = false;
    this.imageSrc = null;
    this.selectedFile = undefined;
  }

  formatData(): Input | null {
    let sentImage = this.imageSrc;
    if(sentImage !== null){
      sentImage = sentImage.replace(/^data:.*?;base64,/, '');
      console.log(sentImage.slice(0, 20));
    }
    else{
      alert("Error: No Image Given.")
      return null;
    }

    // Ensure all fields have entries, add letter to letter choices.
    if(this.input.question === null){
      alert("Error: The entered question is invalid.")
      return null;
    }
    if(this.input.a === null){
      alert("Error: A letter selection is invalid.")
      return null;
    }
    
    if(this.input.b === null){
      alert("Error: B letter selection is invalid.")
      return null;
    }
    
    if(this.input.c === null){
      alert("Error: C letter selection is invalid.")
      return null;
    }
    
    if(this.input.d === null){
      alert("Error: D letter selection is invalid.")
      return null;
    }
    

    const sentInput : Input = {
      image: sentImage,
      question: this.input.question,
      a: "A: " + this.input.a,
      b: "B: " + this.input.b,
      c: "C: " + this.input.c,
      d: "D: " + this.input.d,
    }

    // Data is not formatted an validity is ensured.
    return sentInput;
  }

  submit() {
    // Format data and ensure it is valid.
    const sentInput = this.formatData();
    if(sentInput === null) {
      return;
    }

    this.Model(sentInput);

  }

  Model(model_in : Input) {
    // Create payload
    const body = {inputs : model_in}
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
    console.log("About to send...")

    // POST <url> with body and headers, then log and save the JSON that comes back
    let ret_str = '';
    this.http.post<ModelResponse>(this.apiURL, body, { headers: headers }).subscribe({
      next: config => {    
      console.log('Config fetched successfully:', typeof config);
      
      const ret_json = config;
      console.log('ret_json:', ret_json);

      const resp_str = ret_json.response;
      console.log('resp_str:', resp_str);

      const resp_list = resp_str.split("ASSISTANT:");
      this.answer = resp_list[resp_list.length - 1].trim();
      console.log('Extracted answer:', this.answer);
      alert('Answer: ' + this.answer)

      this.showAnswer = true;

      this.cdr.detectChanges();
      },  
      error: err => {    // If the request times out, an error will have been emitted.  
        alert(err)
        return;
      }
    });
  }

  reset(){
    this.input= {
      image: null,
      question: null,
      a: null,
      b: null,
      c: null,
      d: null,
    }
    this.resetImage();
    this.cdr.detectChanges();
  }


  jump(e: KeyboardEvent,
     current: HTMLElement,
     next:   HTMLElement | null,
     prev:   HTMLElement | null = null): void {

    switch (e.key) {
      /* Down‑arrow or Enter ➜ next field ------------------------------*/
      case 'ArrowDown':
      case 'Enter':
        if (next) { e.preventDefault(); next.focus(); }
        break;

      /* Up‑arrow ➜ previous field -------------------------------------*/
      case 'ArrowUp':
        if (prev) { e.preventDefault(); prev.focus(); }
        break;

      default:
        /* Let all other keys act normally */
        return;
    }
  }

}

/* 
 let resp = {};
    this.http.post(this.apiURL, body, { headers: headers }).subscribe(data => {
      console.log(data);
      resp = data
    });

{ response: "USER: \nBased on the image and the caption, 
answer the following multiple-choice question by selecting the correct letter.
\nQuestion: What are those red spots on this persons stomach
\nA: hives\nB: warts\nC: freckles\nD: a rash\n ASSISTANT: Answer:  ASSISTANT: D" }

*/
