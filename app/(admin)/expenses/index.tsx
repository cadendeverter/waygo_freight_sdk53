// waygo-freight/app/(admin)/expenses/index.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../state/authContext';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Heading from '../../../components/typography/Heading';
import { fetchAllExpensesForAdmin } from '../../../services/expenseService';
import { ExpenseReport } from '../../../utils/types';
import ListItem from '../../../components/ListItem';
import { DollarSign, ChevronRight } from '../../../utils/icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatusBadge from '../../../components/StatusBadge';
import Paragraph from '../../../components/typography/Paragraph';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

type StatusFilter = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export default function AdminExpensesScreen() {
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
            <View className="flex-row items-center justify-between flex-1">
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <DollarSign size={16} color="#4B5563" className="mr-2" />
                        <Text className="font-medium text-gray-700">{item.category}</Text>
                    </View>
                    <Text className="text-sm text-gray-500">
                        {item.driverName} • {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="font-bold text-gray-900">${item.amount.toFixed(2)}</Text>
                    <StatusBadge status={item.status} className="mt-1" />
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
            <Stack.Screen options={{ title: 'Expense Approvals' }} />
            
            <View className="p-4 bg-white border-b border-gray-200">
                <View className="flex-row justify-between mb-4">
                    <Heading>Expense Reports</Heading>
                </View>
                
                <View className="flex-row p-1 bg-gray-100 rounded-lg">
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
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center p-8">
                        <DollarSign size={32} color="#9CA3AF" className="mb-2" />
                        <Paragraph>No expenses found</Paragraph>
                    </View>
                }
            />
        </ScreenWrapper>
    );
}

const TabButton = ({ title, isActive, onPress }: { title: string, isActive: boolean, onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-1 py-2 rounded-md items-center ${isActive ? 'bg-white shadow-sm' : ''}`}
    >
        <Text className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
            {title}
        </Text>
    </TouchableOpacity>
);
