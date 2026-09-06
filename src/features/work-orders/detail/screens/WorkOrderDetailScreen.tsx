import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { messages } from '@/core/constants';
import {
  Badge,
  Button,
  ScreenShell,
  SurfaceCard,
  Text,
} from '@/core/integrations/ui';
import { Priority } from '@/core/types';
import { colours, spacing } from '@/core/theme';
import { formatDisplayDate } from '@/core/utils';

import { DetailChecklist } from '../components/DetailChecklist';
import {
  DetailErrorState,
  DetailLoadingState,
  DetailNotFoundState,
} from '../components/DetailStates';
import { DetailStatusChips } from '../components/DetailStatusChips';
import { STATUS_LABELS } from '../constants/detailUi';
import { useWorkOrderDetail } from '../hooks/useWorkOrderDetail';

type WorkOrderDetailScreenProps = {
  id: string;
};

/**
 * Presentational work-order detail — one ViewModel, brief layout order.
 */
export function WorkOrderDetailScreen({ id }: WorkOrderDetailScreenProps) {
  const {
    ui,
    statusErrorMessage,
    isStatusPending,
    isDeleting,
    onChangeStatus,
    onRetryStatus,
    onRetryLoad,
    onEdit,
    onDelete,
    onChecklistPress,
  } = useWorkOrderDetail(id);

  if (ui.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        <ScreenShell>
          <DetailLoadingState />
        </ScreenShell>
      </SafeAreaView>
    );
  }

  if (ui.status === 'notFound') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        <ScreenShell>
          <DetailNotFoundState message={ui.message} />
        </ScreenShell>
      </SafeAreaView>
    );
  }

  if (ui.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        <ScreenShell>
          <DetailErrorState message={ui.message} onRetry={onRetryLoad} />
        </ScreenShell>
      </SafeAreaView>
    );
  }

  const { workOrder } = ui;
  const priorityIsUrgent = workOrder.priority === Priority.Urgent;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScreenShell>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text role="label" style={styles.muted}>
              {workOrder.reference}
            </Text>
            <Text role="title">{workOrder.title}</Text>
            <View style={styles.badgeRow}>
              <Badge status={workOrder.status}>
                {STATUS_LABELS[workOrder.status]}
              </Badge>
              <Text
                role="body"
                style={priorityIsUrgent ? styles.urgent : undefined}
              >
                Priority: {workOrder.priority}
              </Text>
            </View>
          </View>

          <SurfaceCard>
            <MetaRow label="Site" value={workOrder.site} />
            <MetaRow
              label="Assignee"
              value={workOrder.assignee?.name ?? 'Unassigned'}
            />
            <MetaRow label="Due" value={formatDisplayDate(workOrder.dueAt)} />
          </SurfaceCard>

          <SurfaceCard>
            <Text role="heading">Description</Text>
            <Text role="body" style={styles.bodyText}>
              {workOrder.description.trim() !== ''
                ? workOrder.description
                : 'No description.'}
            </Text>
          </SurfaceCard>

          <SurfaceCard>
            <Text role="heading">Checklist</Text>
            <DetailChecklist
              items={workOrder.checklist}
              onPressItem={onChecklistPress}
            />
          </SurfaceCard>

          <SurfaceCard>
            <Text role="heading">Status</Text>
            <DetailStatusChips
              current={workOrder.status}
              isDisabled={isStatusPending || isDeleting}
              onChange={onChangeStatus}
            />
            {statusErrorMessage != null ? (
              <View style={styles.statusError}>
                <Text role="caption" style={styles.danger}>
                  {statusErrorMessage}
                </Text>
                <Button variant="secondary" size="md" onPress={onRetryStatus}>
                  {messages.retry}
                </Button>
              </View>
            ) : null}
          </SurfaceCard>

          <View style={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              onPress={onEdit}
              isDisabled={isDeleting}
            >
              {messages.edit}
            </Button>
            <Button
              variant="destructive"
              size="md"
              onPress={onDelete}
              isDisabled={isDeleting || isStatusPending}
              isLoading={isDeleting}
            >
              {messages.delete}
            </Button>
          </View>
        </ScrollView>
      </ScreenShell>
    </SafeAreaView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text role="label" style={styles.metaLabel}>
        {label}
      </Text>
      <Text role="body" style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colours.bg,
  },
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  hero: {
    gap: spacing[2],
  },
  muted: {
    color: colours.fgMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  urgent: {
    color: colours.danger,
  },
  bodyText: {
    color: colours.fg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  metaLabel: {
    width: 88,
    color: colours.fgMuted,
  },
  metaValue: {
    flex: 1,
  },
  statusError: {
    gap: spacing[2],
  },
  danger: {
    color: colours.danger,
  },
  actions: {
    gap: spacing[3],
  },
});
