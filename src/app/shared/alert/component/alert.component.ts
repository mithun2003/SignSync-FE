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
   * @description Closes the dialog with a true value indicating "Done" button is clicked.
   */
  done(): void {
    this.dialogRef.close(true);
  }

  /**
   * Closes the dialog with a false value indicating "Cancel" button is clicked.
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  get iconBgColor(): string {
    return this.getColor(this.alertContent.iconBgColor, 'bg');
  }

  get iconInnerBgColor(): string {
    return this.getColor(this.alertContent.iconBgColor, 'inner');
  }

  private getColor(colorName: IconBgColor, type: 'bg' | 'inner'): string {
    const colors: Record<IconBgColor, {
        bg: string;
        inner: string;
      }> = {
      green: {
        bg: 'bg-common-green-bg-color',
        inner: 'bg-common-green-secondary-bg-color'
      },
      red: {
        bg: 'bg-red-bg',
        inner: 'bg-common-red-secondary-bg-color'
      },
      blue: {
        bg: 'bg-common-primary-blue-bg-color',
        inner: 'bg-common-primary-blue-secondary-bg-color'
      },
      yellow: {
        bg: 'bg-common-yellow-bg-color',
        inner: 'bg-common-yellow-secondary-bg-color'
      }
    };

    return colors[colorName]?.[type] || '#ffffff'; // Default to white if color is not found
  }
}
