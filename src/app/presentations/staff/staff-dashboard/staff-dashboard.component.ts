import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffCalendarEventsComponent } from '../staff-calendar-events/staff-calendar-events.component';
import { StaffToDoComponent } from '../staff-to-do/staff-to-do.component';
import { StaffAttendanceViewerComponent } from '../staff-attendance-viewer/staff-attendance-viewer.component';
import { MessageService } from 'primeng/api';
import { PrimeNgModules } from '../../../primeng.modules';

@Component({
  selector: 'app-staff-dashboard',
  imports: [
    CommonModule,
    StaffCalendarEventsComponent,
    StaffToDoComponent,
    StaffAttendanceViewerComponent,
    PrimeNgModules
  ],
  providers: [MessageService],
  templateUrl: './staff-dashboard.component.html',
  styleUrl: './staff-dashboard.component.scss'
})
export class StaffDashboardComponent {
  @ViewChild(StaffAttendanceViewerComponent) attendanceViewer!: StaffAttendanceViewerComponent;

  constructor(private messageService: MessageService) {}

  placeOrder() {
    this.messageService.add({
      severity: 'info',
      summary: 'Place Order',
      detail: 'Place Order functionality coming soon!',
    });
  }

  requestAttendance() {
    // Attendance is now automatically marked, just show info
    this.messageService.add({
      severity: 'info',
      summary: 'Attendance',
      detail: 'Attendance is automatically marked when you visit the dashboard.',
    });
  }

  recordExpense() {
    this.messageService.add({
      severity: 'info',
      summary: 'Record Expense',
      detail: 'Record Expense functionality coming soon!',
    });
  }

  receivePayment() {
    this.messageService.add({
      severity: 'info',
      summary: 'Receive Payment',
      detail: 'Receive Payment functionality coming soon!',
    });
  }

  calendarAction(action: string) {
    // Dummy implementation for calendar actions
    this.messageService.add({
      severity: 'info',
      summary: 'Calendar Action',
      detail: `${action} action triggered`,
    });
  }
}
