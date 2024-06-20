import { Component, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';

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

  constructor(private elRef: ElementRef) { }

  ngOnInit(): void {
    this.selectedDate = this.currentDate;
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
    this.generateCalendar();
    this.currentYear = new Date().getFullYear();
    this.updateYearsGrid();
  }

  updateYearsGrid() {
    this.startYear = this.currentYear - 10;
    this.endYear = this.currentYear;
    this.years = [];

    for (let i = this.startYear; i <= this.endYear; i += 2) {
      this.years.push([i, i + 1]);
    }
  }

  nextYears() {
    this.currentYear += 10;
    this.updateYearsGrid();
  }

  previousYears() {
    this.currentYear -= 10;
    this.updateYearsGrid();
  }

  setCurrentYear(year: any) {
    this.currentYear = year;
    this.dateVal = year;
  }

  setCurrentMonth(month: any) {
    const monthIndex = this.months.findIndex(x => x.toLowerCase() == month.toLowerCase());
    this.currentMonth = monthIndex;
    this.dateVal = `${month}-${this.currentYear}`;
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
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
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
  }
}
