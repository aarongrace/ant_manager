export default class User {
  id: string;
  name: string;
  clan: string;
  images: string[];
  createdDate: Date;
  password: string;
  email: string;
  role: string;

  constructor(
    id: string,
    name: string,
    clan: string,
    images: string[],
    createdDate: Date,
    password: string,
    email: string,
    role: string
  ) {
    this.id = id;
    this.name = name;
    this.clan = clan;
    this.images = images;
    this.createdDate = createdDate;
    this.password = password;
    this.email = email;
    this.role = role;
  }
}