import React, { useCallback, useEffect } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { Text } from '../../../components/ui/text'
import OrderCard from '../../../components/orders/OrderCard'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchOrders, selectOrders, selectOrdersStatus } from '../../../store/slices/ordersSlice'
import type { OrdersStackScreenProps } from '../../../navigation/types'
import type { Order } from '../../../types/orders'

export default function MyTicketsScreen({ navigation }: OrdersStackScreenProps<'MyTicketsList'>) {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const status = useAppSelector(selectOrdersStatus)

  const loadOrders = useCallback(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handlePress = (order: Order) => {
    navigation.navigate('OrderDetail', { orderId: String(order.id) })
  }

  if (status === 'loading' && orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    )
  }

  if (status === 'failed' && orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-foreground text-base font-semibold">Couldn't load your tickets</Text>
        <Text className="text-muted-foreground text-sm mt-1 text-center">Pull down to try again.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={orders}
        keyExtractor={(order) => String(order.id)}
        contentContainerClassName="p-4 gap-3"
        refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={loadOrders} />}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => handlePress(item)} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-foreground text-base font-semibold">No tickets yet</Text>
            <Text className="text-muted-foreground text-sm mt-1 text-center">
              You haven't purchased any tickets yet.
            </Text>
          </View>
        }
      />
    </View>
  )
}
