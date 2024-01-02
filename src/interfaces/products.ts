export interface IProduct {
  id: number
  name: string
  price: number
  discountRate: number
  month: number
  isAvailable: boolean
}

export type IProductsList = [IProduct]
