import { useCallback } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { messages } from '@/core/constants';
import { Button, Text } from '@/core/integrations/ui';
import type { WorkOrder } from '@/core/types';
import { colours, spacing } from '@/core/theme';

import { WorkOrderListRow } from '../components/WorkOrderListRow';
import {
  ListEmptyState,
  ListErrorState,
  ListFilteredEmptyState,
  ListLoadMoreFooter,
  ListLoadingState,
} from '../components/WorkOrderListStates';
import { WorkOrderSearchBar } from '../components/WorkOrderSearchBar';
import { WorkOrderStatusFilter } from '../components/WorkOrderStatusFilter';
import {
  LIST_INITIAL_NUM_TO_RENDER,
  LIST_MAX_TO_RENDER_PER_BATCH,
  LIST_WINDOW_SIZE,
  ROW_HEIGHT,
} from '../constants/listUi';
import { useWorkOrderList } from '../hooks/useWorkOrderList';

/**
 * Presentational work-order list screen — one ViewModel, token layout, FlatList knobs.
 */
export function WorkOrderListScreen() {
  const {
    ui,
    searchResetNonce,
    statusFilter,
    isRefreshing,
    isFetchingNextPage,
    onQueryChange,
    onSearchPendingChange,
    onStatusChange,
    onClearFilters,
    onRetry,
    onRefresh,
    onEndReached,
    onPressRow,
    onPressCreate,
  } = useWorkOrderList();

  const keyExtractor = useCallback((item: WorkOrder) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<WorkOrder> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback<ListRenderItem<WorkOrder>>(
    ({ item }) => <WorkOrderListRow item={item} onPress={onPressRow} />,
    [onPressRow],
  );

  const listFooter = useCallback(
    () => <ListLoadMoreFooter isVisible={isFetchingNextPage} />,
    [isFetchingNextPage],
  );

  const showBodySpinner = ui.status === 'loading' || ui.status === 'fetching';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text role="title">Work orders</Text>
        <View style={styles.block}>
          <WorkOrderSearchBar
            resetNonce={searchResetNonce}
            onQueryChange={onQueryChange}
            onSearchPendingChange={onSearchPendingChange}
          />
        </View>
        <View style={styles.block}>
          <WorkOrderStatusFilter
            value={statusFilter}
            onChange={onStatusChange}
          />
        </View>
      </View>

      <View style={styles.body}>
        {showBodySpinner ? (
          <ListLoadingState />
        ) : ui.status === 'error' ? (
          <ListErrorState message={ui.message} onRetry={onRetry} />
        ) : ui.status === 'empty' ? (
          <ListEmptyState message={messages.listEmpty} />
        ) : ui.status === 'emptyFiltered' ? (
          <ListFilteredEmptyState onClearFilters={onClearFilters} />
        ) : (
          <FlatList
            data={ui.items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            ListFooterComponent={listFooter}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colours.primary}
                colors={[colours.primary]}
              />
            }
            windowSize={LIST_WINDOW_SIZE}
            maxToRenderPerBatch={LIST_MAX_TO_RENDER_PER_BATCH}
            initialNumToRender={LIST_INITIAL_NUM_TO_RENDER}
            removeClippedSubviews={Platform.OS !== 'android'}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <View style={styles.fab} pointerEvents="box-none">
        <Button
          variant="primary"
          size="md"
          onPress={onPressCreate}
          accessibilityLabel="Create work order"
          style={styles.fabButton}
        >
          +
        </Button>
      </View>
    </SafeAreaView>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colours.bg,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[4],
  },
  block: {
    marginBottom: 0,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  listContent: {
    paddingBottom: spacing[8] + FAB_SIZE,
  },
  fab: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[6],
  },
  fabButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    minWidth: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    paddingHorizontal: 0,
  },
});
