import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Component, importProvidersFrom } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'ClubNet.App';
}

export const appConfig = {
  providers: [
    importProvidersFrom(HttpClientModule, FormsModule)
  ]
};
