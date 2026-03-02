// alert.component.ts - Updated with new design system
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  IAlertData,
  IAlertDefaultContent,
  IconBgColor
} from '../model/alert.model';
import { CommonButtonComponent } from '../../components/common-button/common-button.component';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CommonButtonComponent,
    MatDialogModule,
    FontAwesomeModule
  ]
})
export class AlertComponent implements OnInit {
  public dialogRef = inject(MatDialogRef<AlertComponent>);
  alertData: IAlertData = inject(MAT_DIALOG_DATA);
  alertContent: IAlertDefaultContent = this.alertData.data;

  ngOnInit(): void {
    if (this.alertContent.close) {
      setTimeout(() => {
        this.dialogRef.close(true);
      }, this.alertContent.timeout);
    }
  }

  /**
   * Closes the dialog with true (OK button clicked)
   */
  done(): void {
    this.dialogRef.close(true);
  }

  /**
   * Closes the dialog with false (Cancel button clicked)
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Get button color based on alert type
   */
  getButtonColor(): string {
    const colorMap: Record<string, string> = {
      success: 'success',
      fail: 'danger',
      warning: 'warning',
      inform: 'primary',
      confirm: 'primary'
    };

    return colorMap[this.alertData.alertType] || 'primary';
  }

  /**
   * Get outer icon background color
   */
  get iconBgColor(): string {
    return this.getColor(this.alertContent.iconBgColor, 'bg');
  }

  /**
   * Get inner icon background color
   */
  get iconInnerBgColor(): string {
    return this.getColor(this.alertContent.iconBgColor, 'inner');
  }

  /**
   * Map color name to new design system classes
   */
  private getColor(colorName: IconBgColor, type: 'bg' | 'inner'): string {
    const colors: Record<IconBgColor, { bg: string; inner: string }> = {
      green: {
        bg: 'bg-success/20',
        inner: 'bg-success/40'
      },
      red: {
        bg: 'bg-danger/20',
        inner: 'bg-danger/40'
      },
      blue: {
        bg: 'bg-info/20',
        inner: 'bg-info/40'
      },
      yellow: {
        bg: 'bg-warning/20',
        inner: 'bg-warning/40'
      }
    };

    return colors[colorName]?.[type] || 'bg-bg-primary';
  }
}