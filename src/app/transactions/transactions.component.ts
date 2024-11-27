import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, mergeMap, Observable, retryWhen, Subscription, switchMap, take, takeWhile, timer } from 'rxjs';

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
  searchId: string = '';
  searchedTransaction: any | null = null; 
  randomTransaction: any;
  private submissionInterval!: Subscription;
  private isSubmitting = false;

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

  getRandomInt() {
    return Math.floor(Math.random() * (Math.floor(500) - Math.min(1) + 1) + Math.min(1));
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  submitPayment() {
    if(this.transaction.amount < 0 || this.transaction.details == ''){
      alert("All fields are required")
    }else{
      this.sendTransaction(this.transaction).subscribe(response => {
        this.getAllTransactions();
      }, error => {
        alert('Transaction failed: Connection Error has occurred')
        console.error('Transaction failed:', error);
      });
    }

  }

  getRules() {
    this.getTaxRules().subscribe(response => {
      this.rules = response;
      console.log('Rules gotten:', response);
    }, error => {
      alert('Getting rules failed: Connection Error has occurred')
      console.error('Getting rules failed:', error);
    });
  }

  getAllTransactions() {
    this.getTransactions().subscribe(response => {
      this.transactions = response;
      console.log('Transactions gotten:', response);
    }, error => {
      alert('Get Transaction failed: Connection Error has occurred')
      console.error('Get Transactions failed:', error);
    });
  }

  private sendTransaction(transaction: any): Observable<any> {
    const url = 'http://localhost:8080/api/transactions';
    return this.http.post(url, transaction)
    .pipe(
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

  startSubmitting(times: number) {
    if (!this.isSubmitting) {
      this.isSubmitting = true;

      this.submissionInterval = interval(1000).pipe(
        take(times),
        switchMap(() => {
          this.randomTransaction = {
            amount: this.getRandomInt(),
            details: "Test generated with 10% tax",
            taxRuleId: 1
          }
          return this.sendTransaction(this.randomTransaction);
        })
      ).subscribe({
        next: (response) => {
          console.log('Transaction successful:', response);
          this.getAllTransactions();
        },
        error: (error) => {
          console.error('Transaction failed:', error);
          alert('Transaction failed: ' + error.error.message);
        }
      });
    }
  }

  stopSubmitting() {
    if (this.isSubmitting) {
      this.isSubmitting = false;
      if (this.submissionInterval) {
        this.submissionInterval.unsubscribe();
      }
    }
  }

  ngOnDestroy() {
    if (this.submissionInterval) {
      this.submissionInterval.unsubscribe();
    }
  }

}
