// waygo-freight/app/(admin)/fleet/index.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl, Alert, Text } from 'react-native';
import { styled } from 'nativewind';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Heading from '../../../components/typography/Heading';
import Paragraph from '../../../components/typography/Paragraph';
import { fetchAllVehiclesForAdmin } from '../../../services/vehicleService';
import { Vehicle } from '../../../utils/types';
import ListItem from '../../../components/ListItem';
import { Truck, ChevronRight, PlusCircle } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';

const StyledView = styled(View);

export default function AdminFleetScreen() {
    const router = useRouter();
    const { user: adminUser } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadVehicles = useCallback(async () => {
        if (!adminUser?.companyId) {
            Alert.alert('Error', 'Could not determine your company.');
            setIsLoading(false);
            return;
        }
        try {
            const fetchedVehicles = await fetchAllVehiclesForAdmin(adminUser.companyId);
            setVehicles(fetchedVehicles);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to fetch vehicles.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [adminUser?.companyId]);

    useFocusEffect(loadVehicles);

    const onRefresh = () => {
        setIsRefreshing(true);
        loadVehicles();
    };

    const renderVehicleItem = ({ item }: { item: Vehicle }) => (
        <ListItem onPress={() => router.push(`/fleet/${item.id}`)}>
            <View className="flex-row items-center justify-between flex-1">
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <Truck size={16} color="#4B5563" className="mr-2" />
                        <Text className="font-medium text-gray-700">
                            {item.year} {item.make} {item.model}
                        </Text>
                    </View>
                    <Text className="text-sm text-gray-500">
                        {item.licensePlate} • {item.vin?.slice(-6) || 'No VIN'}
                    </Text>
                </View>
                <View className="items-end">
                    <StatusBadge status={item.status} className="mb-1" />
                    <Text className="text-xs text-gray-500">
                        {item.odometer?.toLocaleString() || 'N/A'} mi
                    </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" className="ml-2" />
            </View>
        </ListItem>
    );

    if (isLoading && !isRefreshing) {
        return <LoadingSpinner />;
    }

    return (
        <ScreenWrapper className="bg-gray-50">
            <Stack.Screen options={{ title: 'Fleet Management' }} />
            
            <View className="p-4 bg-white border-b border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Heading>Fleet Management</Heading>
                        <Paragraph className="text-gray-600">
                            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in fleet
                        </Paragraph>
                    </View>
                    <Button
                        variant="primary"
                        size="sm"
                        iconLeft={<PlusCircle size={16} color="#FFFFFF" />}
                        onPress={() => router.push('/fleet/new')}
                    >
                        Add Vehicle
                    </Button>
                </View>
            </View>

            <FlatList
                data={vehicles}
                renderItem={renderVehicleItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center p-8">
                        <Truck size={32} color="#9CA3AF" className="mb-2" />
                        <Paragraph>No vehicles found</Paragraph>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onPress={() => router.push('/fleet/new')}
                            iconLeft={<PlusCircle size={16} color="#1F2937" />}
                        >
                            Add Your First Vehicle
                        </Button>
                    </View>
                }
            />
        </ScreenWrapper>
    );
}
