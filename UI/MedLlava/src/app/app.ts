import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { delay, Observable, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Input {
    image: string | null,
    question: string | null,
    a: string | null,
    b: string | null,
    c: string | null,
    d: string | null,
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DragDropModule, MatIconModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('MedLlava');
  private apiURL = "https://y3y4q9sxi6y80ss0.us-east-1.aws.endpoints.huggingface.cloud"

  input: Input = {
    image: null,
    question: null,
    a: null,
    b: null,
    c: null,
    d: null,
  }
  constructor(private cdr: ChangeDetectorRef, private http: HttpClient){}

  // holds the base‑64 data‑URL for preview
  imageSrc: string | null = null;
  // keep the File around if you need to POST later
  selectedFile?: File;
  imageUploaded: boolean = false

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

      delay(500);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  /** let user pick another image */
  resetImage() {
    this.imageUploaded = false;
    this.imageSrc = '';
    this.selectedFile = undefined;
  }

  submit(): Observable < any > {
    // Add image to input
    this.input.image = this.imageSrc;

    // Ensure data integerity


    // Create payload
    const model_in = {inputs : this.input}
    const body = JSON.stringify(model_in)
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
    console.log("About to send...")

    // POST <url> with body and headers, then log the JSON that comes back
    return this.http.post<any>(this.apiURL, body, { headers }).pipe(
      tap(res => console.log('model response →', res))
    );

  }
}
