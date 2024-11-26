import { Routes } from '@angular/router';
import { TransactionsComponent } from './transactions/transactions.component';
import { TaxesComponent } from './taxes/taxes.component';

export const routes: Routes = [
    {path: 'transactions', component: TransactionsComponent},
    {path: 'tax-rules', component: TaxesComponent},
    {path: '', redirectTo: '/transactions', pathMatch: 'full' },
];
