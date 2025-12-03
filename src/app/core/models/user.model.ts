export interface IUserItem {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  secondaryEmail?: string;
  typeUser: IUserType;
  password?: string;
  isGlobalNotificationsReceiver?: boolean;
  createdOn?: Date;
}

export enum IUserType {
  Admin = 'Admin',
  Employee = 'Employee',
  Owner = 'Owner',
}
