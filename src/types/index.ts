export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';
<<<<<<< HEAD
export type ApiPostMethods = "POST" | "PUT" | "DELETE";
export type TPayment: 'card' | 'cash' | '';
=======
>>>>>>> 9b10df9f10cc7ecb622da9e683a643f27da16f23
export type IOrderResponse = {
  id: string;
  total: number;
};

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export interface IProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
}

export interface IOrderRequest extends IBuyer {
  total: number;
  items: string[];
};

export interface IOrderResultApi {
  items: IProduct[];
  total: number;
}
