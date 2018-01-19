import { Observable } from 'rxjs/Observable';
import { UsbDeviceFilter } from './WebUSB';
import { PartialObserver } from 'rxjs/Observer';

export interface OpenMessage {
  type: 'open';
}

export interface CloseMessage {
  type: 'close';
}

export interface DataMessage {
  type: 'data';
  data: Buffer;
}

export type SerialMessage = OpenMessage | CloseMessage | DataMessage

export interface SerialConnectionFactory {
  (messages: Observable<Buffer>, options: {
    path: string;
    baudRate: number;
    deviceFilters: UsbDeviceFilter[];
  }): Observable<SerialMessage>;
}
