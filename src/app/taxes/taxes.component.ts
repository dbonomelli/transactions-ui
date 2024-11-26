import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-taxes',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './taxes.component.html',
  styleUrl: './taxes.component.css'
})
export class TaxesComponent {
  rules: any[] = [];
  selectedTax: any = '';
  taxes: any[] = [];
  searchId: string = ''; // Variable to hold the search ID
  searchedTax: any | null = null; // Variable to hold the searched transaction

  ngOnInit(): void {
      this.getAllTaxes();
  }

  tax = {
    name: '',
    description: '',
    rate: 0,
  };

  constructor(private http: HttpClient) {}

  submitPayment() {
    this.sendTax(this.tax).subscribe(response => {
      alert('Transaction successful:'+ response)
      console.log('Transaction successful:', response);
    }, error => {
      alert('Transaction failed:' + error.message)
      console.error('Transaction failed:', error);
    });
    this.getAllTaxes();
  }

  getAllTaxes() {
    this.getTaxes().subscribe(response => {
      this.taxes = response;
      console.log('Taxes gotten:', response);
    }, error => {
      console.error('Taxes rules failed:', error);
    });
  }

  private sendTax(tax: any): Observable<any> {
    const url = 'http://localhost:8080/api/taxes';
    return this.http.post(url, tax);
  }

  private getTaxes(): Observable<any> {
    const url = 'http://localhost:8080/api/taxes';
    return this.http.get(url);
  }

  searchTax(): void {
    const foundTax = this.taxes.find(txn => txn.id === this.searchId);
    this.searchedTax = foundTax ? { ...foundTax } : null; // Set found transaction or null if not found
  }
}
