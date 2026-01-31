// Product Service (пока не используется, будет подключен с Supabase позже)
import { Product } from '../types'

export const productService = {
  async create(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    // Временная реализация - будет заменена на Supabase позже
    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...product,
      created_at: new Date().toISOString(),
    }
    return newProduct
  },

  async getById(_id: string): Promise<Product | null> {
    // Временная реализация - будет заменена на Supabase позже
    return null
  },
}
