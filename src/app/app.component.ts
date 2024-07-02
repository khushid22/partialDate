import { Component, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ConfirmationService } from 'primeng/api';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  showCalendar: boolean = false;
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  partialSelectedYear: number | null = null;
  partialSelectedMonth: number | null = null;
  currentYear!: number;
  currentMonth!: number;
  partialDate: boolean = false;
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendar: { date: Date | null }[][] = [];
  dateVal: string = '';
  startYear!: number;
  endYear!: number;
  years!: number[][];
  @ViewChild('partialDateBtn') partialDateBtn!: ElementRef;
  @ViewChild('op', { static: false }) overlaypanel!: OverlayPanel;

  constructor(private elRef: ElementRef, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.selectedDate = this.currentDate;
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
    this.generateCalendar();
    this.currentYear = new Date().getFullYear();
    this.updateYearsGrid();
    this.partialSelectedYear = this.currentYear;
    this.partialSelectedMonth = this.currentMonth;
  }

  updateYearsGrid() {
    this.startYear = this.currentYear - 7;
    this.endYear = this.currentYear;
    this.years = [];

    for (let i = this.startYear; i <= this.endYear; i += 2) {
      this.years.push([i, i + 1]);
    }
  }

  nextYears() {
    const nextYear = this.currentYear + 8;
    if (nextYear <= 2024) {
      this.currentYear = nextYear;
    } else {
      this.currentYear = 2024;
    }
    this.updateYearsGrid();
  }

  previousYears() {
    this.currentYear -= 8;
    this.updateYearsGrid();
  }

  setCurrentYear(year: number) {
    this.partialSelectedYear = year;
    this.checkPartialDateCompletion();
  }

  setCurrentMonth(month: any) {
    const monthIndex = this.months.findIndex(x => x.toLowerCase() === month.toLowerCase());
    const maxMonthIndex = this.partialSelectedYear === 2024 ? 5 : 11; // June is month index 5
    if (monthIndex <= maxMonthIndex) {
      this.partialSelectedMonth = monthIndex;
      this.checkPartialDateCompletion();
    }
  }

  checkPartialDateCompletion() {
    if (this.partialSelectedYear !== null) {
      if (this.partialSelectedMonth !== null) {
        this.dateVal = `${this.months[this.partialSelectedMonth]}-${this.partialSelectedYear}`;
      } else {
        this.dateVal = `${this.partialSelectedYear}`;
      }
      this.partialDate = false;
      this.overlaypanel.hide();
    }
  }

  toggleCalendar(event?: any) {
    if (event?.target?.value == "") {
      this.showCalendar = !this.showCalendar;
    } else {
      const selectedDateArr = event?.target?.value?.split('-');
      if (selectedDateArr?.length > 0) {
        if (selectedDateArr.length == 3 && !isNaN(selectedDateArr[0])) {
          this.showCalendar = !this.showCalendar;
        }
        if (this.months.includes(selectedDateArr[0])) {
          this.overlaypanel.show(event);
        }
      }
    }
  }

  toggleFullDate(event: any) {
    if (this.partialDate) {
      this.confirmationService.confirm({
        message: 'Do you want to clear the partial date?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.clearPartialDate();
          this.partialDate = false;
          this.showCalendar = true;
          this.overlaypanel.hide();
          this.preventClosing(event);
        }
      });
    } else {
      this.partialDate = false;
      this.showCalendar = true;
      this.overlaypanel.hide();
      this.preventClosing(event);
    }
  }

  togglePartialDate(event: any) {
    this.partialDate = true;
    this.showCalendar = false;
    this.overlaypanel.show(event);
    this.preventClosing(event);
  }

  clearPartialDate() {
    this.partialSelectedYear = null;
    this.partialSelectedMonth = null;
    this.dateVal = '';
  }

  preventClosing(event: Event) {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  hideCalendar(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showCalendar = false;
    }
  }

  selectDate(dateObj: { date: Date | null }) {
    if (dateObj.date) {
      this.selectedDate = dateObj.date;
      this.dateVal = this.formatDate(dateObj.date);
      let dateArr = this.dateVal.split('-');
      this.currentYear = Number(dateArr[2]);
      this.toggleCalendar();
      this.showCalendar = false;  // Close the calendar
    }
  }

  isSelected(dateObj: { date: Date | null }) {
    return dateObj.date && this.selectedDate && dateObj.date.getTime() === this.selectedDate.getTime();
  }

  isToday(dateObj: { date: Date | null }) {
    const today = new Date();
    return dateObj.date && dateObj.date.getFullYear() === today.getFullYear() &&
      dateObj.date.getMonth() === today.getMonth() && dateObj.date.getDate() === today.getDate();
  }

  prevMonth() {
    if (this.currentMonth > 0) {
      this.currentMonth--;
    } else {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (this.currentYear < currentYear || (this.currentYear === currentYear && this.currentMonth < currentMonth)) {
      if (this.currentMonth < 11) {
        this.currentMonth++;
      } else {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.generateCalendar();
    }
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.calendar = [];
    let currentWeek: { date: Date | null }[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push({ date: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push({ date: new Date(this.currentYear, this.currentMonth, day) });
      if (currentWeek.length === 7) {
        this.calendar.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: null });
      }
      this.calendar.push(currentWeek);
    }
  }

  formatDate(date: Date): string {
    const day = date.getDate();
    const month = this.months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  dialogOpen(e: any) {
    this.partialDate = true;
  }

  isFutureDate(day: any): boolean {
    let isFutureDate = false;
    if (day.date) {
      isFutureDate = day.date > new Date();
    }
    return isFutureDate;
  }

  clearAndEnterNewDate() {
    this.selectedDate = null;
    this.dateVal = '';
    this.showCalendar = false;
    this.partialSelectedYear = null;
    this.partialSelectedMonth = null;
  }

  isPartialYearSelected(year: number): boolean {
    return this.partialSelectedYear === year;
  }

  isPartialMonthSelected(monthIndex: number): boolean {
    const currentMonthIndex = new Date().getMonth();
    const maxMonthIndex = this.partialSelectedYear === 2024 ? 5 : 11;
    return (
      this.partialSelectedMonth === monthIndex &&
      ((this.partialSelectedYear === new Date().getFullYear() && monthIndex <= currentMonthIndex) ||
        (this.partialSelectedYear === 2024 && monthIndex <= maxMonthIndex) ||
        this.partialSelectedYear !== new Date().getFullYear())
    );
  }

  isCurrentYear(year: number): boolean {
    const currentDate = new Date();
    return year === currentDate.getFullYear();
  }

  isCurrentMonth(monthIndex: number): boolean {
    const currentDate = new Date();
    return (
      monthIndex === currentDate.getMonth() &&
      this.partialSelectedYear === currentDate.getFullYear()
    );
  }

  isNextArrowVisible(): boolean {
    return this.currentYear < 2024;
  }

  isMonthSelectable(monthIndex: number): boolean {
    const currentMonthIndex = new Date().getMonth();
    const maxMonthIndex = this.partialSelectedYear === 2024 ? 5 : 11;
    return (
      this.partialSelectedYear !== new Date().getFullYear() ||
      monthIndex <= currentMonthIndex
    );
  }
}
