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
import { Truck, ChevronRight, Plus } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';



const useStyles = () => {
    const { theme } = useTheme();
    return {
        screen: {
            backgroundColor: theme.colors.background,
        },
        headerContainer: {
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerRow: {
            flexDirection: 'row' as 'row',
            justifyContent: 'space-between' as 'space-between',
            alignItems: 'center' as 'center',
            marginBottom: 16,
        },
        headerParagraph: {
            color: theme.colors.textSecondary,
        },
        listItemContainer: {
            flexDirection: 'row' as 'row',
            alignItems: 'center' as 'center',
            justifyContent: 'space-between' as 'space-between',
            flex: 1,
        },
        listItemTextContainer: {
            flex: 1,
        },
        listItemTitleRow: {
            flexDirection: 'row' as 'row',
            alignItems: 'center' as 'center',
            marginBottom: 4,
        },
        listItemIcon: {
            marginRight: 8,
        },
        listItemIconColor: theme.colors.textSecondary,
        listItemChevronColor: theme.colors.placeholder,
        listItemTitle: {
            fontWeight: '500' as '500',
            color: theme.colors.text,
        },
        listItemSubtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        listItemDetailsContainer: {
            alignItems: 'flex-end' as 'flex-end',
        },
        listItemStatusBadge: {
            marginBottom: 4,
        },
        listItemOdometer: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        listItemChevron: {
            marginLeft: 8,
        },
        emptyListContainer: {
            flex: 1,
            alignItems: 'center' as 'center',
            justifyContent: 'center' as 'center',
            padding: 32,
        },
        emptyListText: {
            textAlign: 'center' as 'center',
            color: theme.colors.textSecondary,
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

    useFocusEffect(useCallback(() => {
        loadVehicles();
    }, [loadVehicles]));

    const onRefresh = () => {
        setIsRefreshing(true);
        loadVehicles();
    };

    const renderVehicleItem = ({ item }: { item: Vehicle }) => (
        <ListItem
            onPress={() => router.push(`/fleet/${item.id}`)}
            title={`${item.year} ${item.make} ${item.model}`}
            subtitle={item.licensePlate}
            left={() => <Truck size={24} color={styles.listItemIconColor} />}
            right={() => (
                <View style={{ alignItems: 'flex-end' }}>
                    <StatusBadge status={item.status} />
                    <Text style={styles.listItemOdometer}>
                        {item.odometer?.toLocaleString() || 'N/A'} mi
                    </Text>
                </View>
            )}
        />
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
                        mode="contained"
                        compact
                        onPress={() => router.push('/fleet/new')}
                        icon={<Plus size={16} color="#FFFFFF" />}
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
                        <Truck size={32} color={styles.listItemChevronColor} style={{ marginBottom: 8 }} />
                        <Paragraph style={styles.emptyListText}>No vehicles found</Paragraph>
                        <Button
                            mode="outlined"
                            compact
                            style={{ marginTop: 16 }}
                            onPress={() => router.push('/fleet/new')}
                            icon={<Plus size={16} color={styles.listItemIconColor} />}
                        >
                            Add Your First Vehicle
                        </Button>
                    </View>
                }
            />
        </ScreenWrapper>
    );
}
