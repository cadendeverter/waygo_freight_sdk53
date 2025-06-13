// waygo-freight/app/(admin)/expenses/index.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl, Alert, TouchableOpacity } from 'react-native';

import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useTheme } from '../../../theme/ThemeContext';
import Heading from '../../../components/typography/Heading';
import { fetchAllExpensesForAdmin } from '../../../services/expenseService';
import { ExpenseReport } from '../../../utils/types';
import ListItem from '../../../components/ListItem';
import { DollarSign, ChevronRight } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatusBadge from '../../../components/StatusBadge';
import Paragraph from '../../../components/typography/Paragraph';

type StatusFilter = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

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
            marginBottom: 16,
        },
        tabsContainer: {
            flexDirection: 'row' as 'row',
            padding: 4,
            backgroundColor: theme.colors.divider,
            borderRadius: 8,
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
        listItemCategory: {
            fontWeight: '500' as '500',
            color: theme.colors.text,
        },
        listItemDetails: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        listItemAmountContainer: {
            alignItems: 'flex-end' as 'flex-end',
        },
        listItemAmount: {
            fontWeight: 'bold' as 'bold',
            color: theme.colors.onSurface,
        },
        listItemStatusBadge: {
            marginTop: 4,
        },
        listItemChevron: {
            marginLeft: 8,
        },
        listContentContainer: {
            padding: 16,
        },
        emptyListContainer: {
            alignItems: 'center' as 'center',
            justifyContent: 'center' as 'center',
            padding: 32,
        },
        emptyListIcon: {
            marginBottom: 8,
        },
        tabButton: {
            flex: 1,
            paddingVertical: 8,
            borderRadius: 6,
            alignItems: 'center' as 'center',
        },
        activeTabButton: {
            backgroundColor: theme.colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        tabButtonText: {
            fontSize: 14,
            fontWeight: '500' as '500',
            color: theme.colors.textSecondary,
        },
        activeTabButtonText: {
            color: theme.colors.onSurface,
        },
    };
};

export default function AdminExpensesScreen() {
    const styles = useStyles();
    const router = useRouter();
    const { user: adminUser } = useAuth();
    const [expenses, setExpenses] = useState<ExpenseReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<StatusFilter>('PENDING_APPROVAL');

    const loadExpenses = useCallback(async (tab: StatusFilter) => {
        if (!adminUser?.companyId) return;
        setIsLoading(true);
        try {
            const { expenses: fetchedExpenses } = await fetchAllExpensesForAdmin(adminUser.companyId, tab);
            setExpenses(fetchedExpenses);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to fetch expenses.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [adminUser?.companyId]);

    useFocusEffect(
        useCallback(() => {
            loadExpenses(activeTab);
        }, [activeTab, loadExpenses])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        loadExpenses(activeTab);
    };

    const handleExpensePress = (expenseId: string) => {
        router.push(`/expenses/${expenseId}`);
    };

    const renderExpenseItem = ({ item }: { item: ExpenseReport }) => (
        <ListItem onPress={() => handleExpensePress(item.id)}>
            <View style={styles.listItemContainer}>
                <View style={styles.listItemTextContainer}>
                    <View style={styles.listItemTitleRow}>
                        <DollarSign size={16} color={styles.listItemIconColor} style={styles.listItemIcon} />
                        <Text style={styles.listItemCategory}>{item.category}</Text>
                    </View>
                    <Text style={styles.listItemDetails}>
                        {item.driverName} • {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.listItemAmountContainer}>
                    <Text style={styles.listItemAmount}>${item.amount.toFixed(2)}</Text>
                    <StatusBadge status={item.status} style={styles.listItemStatusBadge} />
                </View>
                <ChevronRight size={20} color={styles.listItemChevronColor} style={styles.listItemChevron} />
            </View>
        </ListItem>
    );

    if (isLoading && !isRefreshing) {
        return <LoadingSpinner />;
    }

    return (
        <ScreenWrapper style={styles.screen}>
            <Stack.Screen options={{ title: 'Expense Approvals' }} />
            
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <Heading>Expense Reports</Heading>
                </View>
                
                <View style={styles.tabsContainer}>
                    {['PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((tab) => (
                        <TabButton
                            key={tab}
                            title={tab.split('_').join(' ')}
                            isActive={activeTab === tab}
                            onPress={() => setActiveTab(tab as StatusFilter)}
                        />
                    ))}
                </View>
            </View>

            <FlatList
                data={expenses}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                        <DollarSign size={32} color={styles.listItemChevronColor} style={styles.emptyListIcon} />
                        <Paragraph>No expenses found</Paragraph>
                    </View>
                }
            />
        </ScreenWrapper>
    );
}

const TabButton = ({ title, isActive, onPress }: { title: string, isActive: boolean, onPress: () => void }) => {
    const styles = useStyles();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
        >
            <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};
