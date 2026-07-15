import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { secureApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { Order, OrderDetail } from '../../types/orders'
import type { RootState } from '../index'
import { logout } from './authSlice'

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface OrdersState {
  orders: Order[]
  status: FetchStatus
  detailsById: Record<number, OrderDetail>
  detailStatus: FetchStatus
  createStatus: FetchStatus
}

const initialState: OrdersState = {
  orders: [],
  status: 'idle',
  detailsById: {},
  detailStatus: 'idle',
  createStatus: 'idle',
}

export const fetchOrders = createAsyncThunk('orders/fetchAll', async () => {
  const res = await secureApi.get<{ data: Order[] }>(END_POINTS.ORDERS)
  return res.data.data
})

export const fetchOrderDetail = createAsyncThunk('orders/fetchDetail', async (orderId: number) => {
  const res = await secureApi.get<{ data: OrderDetail }>(END_POINTS.ORDER_DETAIL(orderId))
  return res.data.data
})

export interface CreateOrderPayload {
  event: number
  items: { ticket_tier: number; quantity: number }[]
}

export const createOrder = createAsyncThunk('orders/create', async (payload: CreateOrderPayload) => {
  const res = await secureApi.post<{ data: OrderDetail }>(END_POINTS.ORDERS, payload)
  return res.data.data
})

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.detailStatus = 'loading'
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.detailsById[action.payload.id] = action.payload
      })
      .addCase(fetchOrderDetail.rejected, (state) => {
        state.detailStatus = 'failed'
      })
      .addCase(createOrder.pending, (state) => {
        state.createStatus = 'loading'
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.detailsById[action.payload.id] = action.payload
      })
      .addCase(createOrder.rejected, (state) => {
        state.createStatus = 'failed'
      })
      .addCase(logout, () => initialState)
  },
})

export default ordersSlice.reducer

export const selectOrders = (state: RootState) => state.orders.orders
export const selectOrdersStatus = (state: RootState) => state.orders.status
export const selectOrderDetailStatus = (state: RootState) => state.orders.detailStatus
export const selectOrderDetail = (orderId: number) => (state: RootState) =>
  state.orders.detailsById[orderId]
export const selectCreateOrderStatus = (state: RootState) => state.orders.createStatus
