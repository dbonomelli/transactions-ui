import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mergeMap, Observable, retryWhen, timer } from 'rxjs';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit{

  rules: any[] = [];
  selectedTax: any = '1';
  transactions: any[] = [];
  searchId: string = ''; // Variable to hold the search ID
  searchedTransaction: any | null = null; // Variable to hold the searched transaction

  ngOnInit(): void {
      this.getRules();
      this.getAllTransactions();
  }

  transaction = {
    amount: 0,
    details: '',
    taxRuleId: this.selectedTax,
  };

  constructor(private http: HttpClient) {}

  submitPayment() {
    this.sendTransaction(this.transaction).subscribe(response => {
    }, error => {
      alert('Transaction failed:' + error.error.message)
      console.error('Transaction failed:', error);
    });
    this.getAllTransactions();
  }

  getRules() {
    this.getTaxRules().subscribe(response => {
      this.rules = response;
      console.log('Rules gotten:', response);
    }, error => {
      alert('Getting rules failed:' + error.error.message)
      console.error('Getting rules failed:', error);
    });
  }

  getAllTransactions() {
    this.getTransactions().subscribe(response => {
      this.transactions = response;
      console.log('Transactions gotten:', response);
    }, error => {
      alert('Get Transaction failed:' + error.error.message)
      console.error('Get Transactions failed:', error);
    });
  }

  private sendTransaction(transaction: any): Observable<any> {
    const url = 'http://localhost:8080/api/transactions';
    return this.http.post(url, transaction);
  }

  private getTaxRules(): Observable<any> {
    const url = 'http://localhost:8080/api/taxes';
    return this.http.get(url);
  }

  private getTransactions(): Observable<any> {
    const url = 'http://localhost:8080/api/transactions';
    return this.http.get(url).pipe(
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, i) => {
            const retryAttempt = i + 1;
            if (retryAttempt > 3) throw error;
            console.log(`Retrying... Attempt ${retryAttempt}`);
            return timer(1000);
          })
        )
      ));
  }

  onSelectChange(event: any): void {
    this.selectedTax = event.target.value;
    this.transaction.taxRuleId = this.selectedTax;
    console.log('Selected item:', this.selectedTax);
  }

  searchTransaction(): void {
    const foundTransaction = this.transactions.find(txn => txn.id === this.searchId);
    this.searchedTransaction = foundTransaction ? { ...foundTransaction } : null; // Set found transaction or null if not found
  }
}
