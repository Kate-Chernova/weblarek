import { Api } from '../base/Api';
import { IApi, IOrderRequest, IOrderResponse, IOrderResultApi } from '../../types/index';

export class ServerApi {
  protected api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  async getProducts(): Promise<IOrderResultApi> {
    return this.api.get<IOrderResultApi>('/product/'); 
  }

  async postOrder(orderRequest: IOrderRequest): Promise<TOrderResponse> {
    return this.api.post('/order/', orderRequest);
  }
}