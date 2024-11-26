import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TaxesComponent } from './taxes/taxes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TransactionsComponent, TaxesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'transact';
}
