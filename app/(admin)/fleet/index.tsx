// waygo-freight/app/(admin)/fleet/index.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, View, RefreshControl, Alert, Text } from 'react-native';

import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext'; // Assuming theme context is here
import Heading from '../../../components/typography/Heading';
import Paragraph from '../../../components/typography/Paragraph';
import { fetchAllVehiclesForAdmin } from '../../../services/vehicleService';
import { Vehicle } from '../../../utils/types';
import ListItem from '../../../components/ListItem';
import { Truck, ChevronRight, PlusCircle } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';



const useStyles = () => {
    const { theme } = useTheme();
    return {
        screen: {
            backgroundColor: theme.colors.background, // bg-gray-50
        },
        headerContainer: {
            padding: 16, // p-4
            backgroundColor: theme.colors.surface, // bg-white
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border, // border-gray-200
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16, // mb-4
        },
        headerParagraph: {
            color: theme.colors.textSecondary, // text-gray-600
        },
        listItemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
        },
        listItemTextContainer: {
            flex: 1,
        },
        listItemTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4, // mb-1
        },
        listItemIcon: {
            marginRight: 8, // mr-2
        },
        listItemTitle: {
            fontWeight: '500' as '500',
            color: theme.colors.text, // text-gray-700
        },
        listItemSubtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary, // text-gray-500
        },
        listItemDetailsContainer: {
            alignItems: 'flex-end',
        },
        listItemStatusBadge: {
            marginBottom: 4, // mb-1
        },
        listItemOdometer: {
            fontSize: 12,
            color: theme.colors.textSecondary, // text-gray-500
        },
        listItemChevron: {
            marginLeft: 8, // ml-2
        },
        emptyListContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32, // p-8
        },
        emptyListText: {
            textAlign: 'center',
            color: theme.colors.textSecondary, // text-gray-500
        },
        contentContainer: {
            padding: 16,
        }
    };
};

export default function AdminFleetScreen() {
    const styles = useStyles();
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
            <View style={styles.listItemContainer}>
                <View style={styles.listItemTextContainer}>
                    <View style={styles.listItemTitleRow}>
                        <Truck size={16} color={styles.listItemIcon.color || "#4B5563"} style={styles.listItemIcon} />
                        <Text style={styles.listItemTitle}>
                            {item.year} {item.make} {item.model}
                        </Text>
                    </View>
                    <Text style={styles.listItemSubtitle}>
                        {item.licensePlate} • {item.vin?.slice(-6) || 'No VIN'}
                    </Text>
                </View>
                <View style={styles.listItemDetailsContainer}>
                    <StatusBadge status={item.status} style={styles.listItemStatusBadge} />
                    <Text style={styles.listItemOdometer}>
                        {item.odometer?.toLocaleString() || 'N/A'} mi
                    </Text>
                </View>
                <ChevronRight size={20} color={styles.listItemChevron.color || "#9CA3AF"} style={styles.listItemChevron} />
            </View>
        </ListItem>
    );

    if (isLoading && !isRefreshing) {
        return <LoadingSpinner />;
    }

    return (
        <ScreenWrapper style={styles.screen}>
            <Stack.Screen options={{ title: 'Fleet Management' }} />
            
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <View>
                        <Heading>Fleet Management</Heading>
                        <Paragraph style={styles.headerParagraph}>
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
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                        <Truck size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                        <Paragraph style={styles.emptyListText}>No vehicles found</Paragraph>
                        <Button
                            variant="outline"
                            size="sm"
                            style={{ marginTop: 16 }}
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
