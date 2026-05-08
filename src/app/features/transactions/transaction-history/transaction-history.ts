import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.html',
  styleUrls: ['./transaction-history.css'],
  standalone: false
})
export class TransactionHistoryComponent implements OnInit {

  allTransactions: any[] = [];
  filteredTransactions: any[] = [];
  paginatedTransactions: any[] = [];

  accounts: any[] = [];

  filterForm!: FormGroup;

  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 1;

  sortColumn: string = 'date';
  sortAscending: boolean = false;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    this.initForm();

    this.loadAccounts();
  }

  initForm(): void {

    this.filterForm = this.fb.group({
      accountId: [''],
      startDate: [''],
      endDate: [''],
      type: ['All'],
      minAmount: [''],
      maxAmount: [''],
      keyword: ['']
    });
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    };
  }

  loadAccounts(): void {

    this.http.get<any>(
      'https://localhost:7085/api/accounts/my',
      { headers: this.getHeaders() }
    ).subscribe({

      next: (res) => {

        // REAL USER ACCOUNTS
        this.accounts = res.data || [];

        // ✅ ADD "ALL ACCOUNTS" OPTION
       

        // ✅ DEFAULT SELECT
        if (this.accounts.length > 0) {

          this.filterForm.patchValue({
            accountId: this.accounts[0].id
          });

          this.applyFilters();
        }

        // ✅ LOAD TRANSACTIONS
        this.applyFilters();
      },

      error: (err) => {

        console.log(err);
      }
    });
  }

  applyFilters(): void {

    this.loading = true;

    const filters = this.filterForm.value;

    const body = {

      accountId: Number(filters.accountId),

      fromDate: filters.startDate || null,

      toDate: filters.endDate || null,

      type: filters.type === 'All'
        ? null
        : filters.type,

      minAmount: filters.minAmount || null,

      maxAmount: filters.maxAmount || null,

      keyword: filters.keyword || null,

      page: this.currentPage,

      pageSize: this.itemsPerPage
    };

    this.http.post<any>(
      'https://localhost:7085/api/transactions/search',
      body,
      { headers: this.getHeaders() }
    ).subscribe({

      next: (res) => {

        const responseData = res.data;

        this.filteredTransactions = responseData.data || [];

        this.filteredTransactions =
          this.sortTransactions(this.filteredTransactions);

        this.totalPages =
          Math.ceil(responseData.totalRecords / this.itemsPerPage) || 1;

        this.updatePagination();

        this.loading = false;
      },

      error: (err) => {

        console.log(err);

        this.loading = false;
      }
    });
  }

  resetFilters(): void {

    this.filterForm.reset({
      accountId: this.accounts.length > 0
        ? this.accounts[0].id
        : '',
      type: 'All'
    });

    this.currentPage = 1;

    this.applyFilters();
  }

  sortBy(column: string): void {

    if (this.sortColumn === column) {

      this.sortAscending = !this.sortAscending;

    } else {

      this.sortColumn = column;

      this.sortAscending = true;
    }

    this.filteredTransactions =
      this.sortTransactions(this.filteredTransactions);

    this.updatePagination();
  }

  sortTransactions(data: any[]): any[] {

    return data.sort((a, b) => {

      let valA: any;
      let valB: any;

      if (this.sortColumn === 'amount') {

        valA = a.amount;
        valB = b.amount;

      } else {

        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }

      if (valA < valB)
        return this.sortAscending ? -1 : 1;

      if (valA > valB)
        return this.sortAscending ? 1 : -1;

      return 0;
    });
  }

  updatePagination(): void {

    const startIndex =
      (this.currentPage - 1) * this.itemsPerPage;

    this.paginatedTransactions =
      this.filteredTransactions.slice(
        startIndex,
        startIndex + this.itemsPerPage
      );
  }

  nextPage(): void {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.applyFilters();
    }
  }

  prevPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.applyFilters();
    }
  }

  exportCsv(): void {

    const filters = this.filterForm.value;

    const body = {
      accountId: filters.accountId,
      fromDate: filters.startDate || null,
      toDate: filters.endDate || null,
      type: filters.type === 'All' ? null : filters.type,
      minAmount: filters.minAmount || null,
      maxAmount: filters.maxAmount || null,
      keyword: filters.keyword || null
    };

    this.http.post(
      'https://localhost:7085/api/transactions/export',
      body,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    ).subscribe(blob => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'transactions.csv';

      a.click();

      window.URL.revokeObjectURL(url);
    });
  }
}
