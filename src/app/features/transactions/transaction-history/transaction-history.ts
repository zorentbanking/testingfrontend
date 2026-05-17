import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.html',
  styleUrls: ['./transaction-history.css'],
  standalone: false
})
export class TransactionHistoryComponent implements OnInit {
  todayDate: string = new Date().toISOString().split('T')[0];

  allTransactions: any[] = [];
  filteredTransactions: any[] = [];
  paginatedTransactions: any[] = [];

  accounts: any[] = [];

  filterForm!: FormGroup;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  sortColumn: string = 'date';
  sortAscending: boolean = false;

  loading = false;

  hasAccounts: boolean = false;

  userName: string = '';
  userEmail: string = '';
  isProfileOpen: boolean = false;

  userPhone: string = '';
  userFullName: string = '';

  userAddress: string = '';
  userUsername: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    this.initForm();

    this.loadAccounts();
    this.loadUserData();
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
  loadUserData(): void {

    const userData =
      localStorage.getItem('user');

    if (userData) {

      const user = JSON.parse(userData);

      console.log(user);

      this.userName =
        user.fullName || 'User';

      this.userEmail =
        user.email || '';

      this.userPhone =
        user.phone || '';

      this.userAddress =
        user.address || '';

      this.userUsername =
        user.username || '';
    }
  }
  toggleProfile(): void {

    this.isProfileOpen = !this.isProfileOpen;
  }
  logout(): void {

    localStorage.removeItem('accessToken');

    localStorage.removeItem('refreshToken');

    localStorage.removeItem('user');

    this.router.navigate(['/login']);
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
        this.accounts =
          (res.data || []).filter(
            (acc: any) =>
              acc.status !== 'Closed'
          );
        this.hasAccounts = this.accounts.length > 0;

        // ✅ ADD "ALL ACCOUNTS" OPTION
       

        // ✅ DEFAULT SELECT
        if (this.accounts.length > 0) {

          this.filterForm.patchValue({
            //accountId: this.accounts[0].id
            accountId: '0'
          });

          this.applyFilters();
        }
        else {
          this.filteredTransactions = [];
          this.paginatedTransactions = [];
          this.totalPages = 1;
        }

        // ✅ LOAD TRANSACTIONS
        //this.applyFilters();
      },

      error: (err) => {

        console.log(err);
        this.hasAccounts = false;
      }
    });
  }

  applyFilters(resetPage: boolean = true): void {

    // ✅ RESET TO FIRST PAGE WHEN FILTERING
    if (resetPage) {
      this.currentPage = 1;
    }

    this.loading = true;

    const filters = this.filterForm.value;

    const body = {

      accountId:
        filters.accountId == '0' || filters.accountId == ' '
          ? null
          : Number(filters.accountId),

      fromDate: filters.startDate || null,

      toDate: filters.endDate || null,

      type:
        filters.type === 'All'
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

        this.filteredTransactions =
          responseData.data || [];

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

      // DEFAULT TO ALL ACCOUNTS
      accountId: '0',

      // DEFAULT TYPE
      type: 'All',

      // CLEAR OTHER FILTERS
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      keyword: ''

    });

    // RESET PAGE
    this.currentPage = 1;

    // LOAD DATA AGAIN
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

    // BACKEND ALREADY RETURNS PAGINATED DATA
    this.paginatedTransactions =
      this.filteredTransactions;
  }

  nextPage(): void {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      // ❌ DON'T RESET PAGE HERE
      this.applyFilters(false);
    }
  }

  prevPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      // ❌ DON'T RESET PAGE HERE
      this.applyFilters(false);
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
