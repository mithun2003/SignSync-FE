import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@layouts/navbar/navbar.component';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './user-layout.component.html',
  standalone: true,
})
export class UserLayoutComponent  {

}
