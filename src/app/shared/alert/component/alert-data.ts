import {
  faCircleCheck,
  faCircleExclamation,
  faCircleQuestion,
  faTriangleExclamation
} from '@fortawesome/pro-solid-svg-icons';
import { IAlertData } from '../model/alert.model';

export class AlertData {
  static getAlertInfo(): IAlertData[] {
    return [
      {
        alertType: 'inform',
        data: {
          title: 'Info',
          content: "You won't be able to revert this!",
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          icon: faCircleExclamation,
          btnClass: '',
          iconClass: 'text-common-blue-color',
          iconBgColor: 'blue'
        }
      },
      {
        alertType: 'fail',
        data: {
          title: 'Oops!',
          content: 'Something went wrong!',
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          refresh: false,
          icon: faCircleExclamation,
          btnClass: '',
          iconClass: 'text-common-primary-red-color',
          iconBgColor: 'red'
        }
      },
      {
        alertType: 'success',
        data: {
          title: 'Success!',
          content: 'Completed Successfully',
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          icon: faCircleCheck,
          btnClass: '',
          iconClass: 'text-common-green-color',
          iconBgColor: 'green'
        }
      },
      {
        alertType: 'confirm',
        data: {
          title: 'Confirm',
          content: "You won't be able to revert this!",
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: true,
          icon: faCircleQuestion,
          btnClass: '',
          iconClass: 'text-common-yellow-color',
          iconBgColor: 'green'
        }
      },
      {
        alertType: 'warning',
        data: {
          title: 'Oops!',
          content: 'Some error occur.',
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          icon: faTriangleExclamation,
          btnClass: '',
          iconClass: 'text-common-yellow-color',
          iconBgColor: 'yellow'
        }
      }
    ];
  }
}
