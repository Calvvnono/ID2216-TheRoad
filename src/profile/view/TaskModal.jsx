import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Colors } from '../../shared/theme/colors';

function TaskRow({ item, completed }) {
  return (
    <View style={styles.taskRow}>
      <Text style={[styles.taskIcon, completed ? styles.taskIconDone : null]}>
        {completed ? '✓' : '○'}
      </Text>
      <View style={styles.taskMain}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {!!item.subtitle && <Text style={styles.taskSubtitle}>{item.subtitle}</Text>}
      </View>
      <Text style={styles.taskXp}>+{item.xp} XP</Text>
    </View>
  );
}

export function TaskModal({ visible, onClose, tasks }) {
  const completed = tasks?.completed ?? [];
  const pending = tasks?.pending ?? [];
  const dailyCompleted = tasks?.dailyCompleted ?? [];
  const dailyPending = tasks?.dailyPending ?? [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Upgrade Tasks</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completed.length ? (
              completed.map((item) => (
                <TaskRow key={item.key} item={item} completed />
              ))
            ) : (
              <Text style={styles.emptyText}>No completed tasks yet.</Text>
            )}

            <Text style={styles.sectionTitle}>Pending</Text>
            {pending.length ? (
              pending.map((item) => (
                <TaskRow key={item.key} item={item} completed={false} />
              ))
            ) : (
              <Text style={styles.emptyText}>All tasks completed.</Text>
            )}

            <Text style={styles.sectionTitle}>Daily Tasks</Text>
            {dailyCompleted.length ? (
              dailyCompleted.map((item) => (
                <TaskRow key={`daily-done-${item.key}`} item={item} completed />
              ))
            ) : null}
            {dailyPending.length ? (
              dailyPending.map((item) => (
                <TaskRow
                  key={`daily-pending-${item.key}`}
                  item={item}
                  completed={false}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Daily tasks completed for today.</Text>
            )}
          </ScrollView>

          <Pressable style={styles.confirmBtn} onPress={onClose}>
            <Text style={styles.confirmText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    maxHeight: '78%',
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
  },
  closeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    maxHeight: 420,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
  },
  taskIcon: {
    width: 18,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  taskIconDone: {
    color: Colors.success,
  },
  taskMain: {
    flex: 1,
  },
  taskTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  taskSubtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  taskXp: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  confirmBtn: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
});
