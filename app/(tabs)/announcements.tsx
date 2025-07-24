import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, AlertTriangle, IndianRupee, UtensilsCrossed, Wrench, Info } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useAnnouncement } from '@/store/announcement-store';
import { AnnouncementType } from '@/types';

export default function AnnouncementsScreen() {
  const { announcements, markAsRead } = useAnnouncement();
  const [selectedFilter, setSelectedFilter] = useState<AnnouncementType | null>(null);
  
  const handleFilterChange = (index: number) => {
    const filters: (AnnouncementType | null)[] = [null, 'Rent', 'Meals', 'Maintenance', 'Emergency'];
    setSelectedFilter(filters[index]);
  };
  
  const handleAnnouncementPress = (id: string) => {
    markAsRead(id);
  };
  
  const getFilteredAnnouncements = () => {
    if (!selectedFilter) return announcements;
    return announcements.filter(a => a.type === selectedFilter);
  };
  
  const getAnnouncementIcon = (type: AnnouncementType, isEmergency: boolean) => {
    if (isEmergency) {
      return <AlertTriangle size={20} color={colors.status.error} />;
    }
    
    switch (type) {
      case 'Rent':
        return <IndianRupee size={20} color={colors.accent.primary} />;
      case 'Meals':
        return <UtensilsCrossed size={20} color={colors.accent.primary} />;
      case 'Maintenance':
        return <Wrench size={20} color={colors.accent.primary} />;
      case 'Emergency':
        return <AlertTriangle size={20} color={colors.status.error} />;
      default:
        return <Info size={20} color={colors.accent.primary} />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Filters */}
      <SegmentedControl
        options={['All', 'Rent', 'Meals', 'Maintenance', 'Emergency']}
        selectedIndex={selectedFilter ? ['Rent', 'Meals', 'Maintenance', 'Emergency'].indexOf(selectedFilter) + 1 : 0}
        onChange={handleFilterChange}
        style={styles.filters}
      />
      
      {/* Announcements List */}
      <View style={styles.announcementsContainer}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color={colors.accent.primary} />
          <Text style={styles.sectionTitle}>
            {selectedFilter ? `${selectedFilter} Announcements` : 'All Announcements'}
          </Text>
        </View>
        
        {getFilteredAnnouncements().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No announcements found</Text>
          </View>
        ) : (
          getFilteredAnnouncements().map(announcement => (
            <TouchableOpacity
              key={announcement.id}
              onPress={() => handleAnnouncementPress(announcement.id)}
              activeOpacity={0.8}
            >
              <Card 
                style={[
                  styles.announcementCard,
                  announcement.isEmergency && styles.emergencyCard,
                ]}
              >
                <View style={styles.announcementHeader}>
                  {getAnnouncementIcon(announcement.type, announcement.isEmergency)}
                  <View style={styles.announcementInfo}>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    <Text style={styles.announcementDate}>
                      {new Date(announcement.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  {announcement.isEmergency && (
                    <View style={styles.emergencyBadge}>
                      <Text style={styles.emergencyText}>URGENT</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.announcementContent}>{announcement.content}</Text>
                
                <View style={styles.announcementFooter}>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{announcement.type}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Extra padding for floating button
  },
  filters: {
    marginBottom: 20,
  },
  announcementsContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  announcementCard: {
    backgroundColor: colors.background.card,
    marginBottom: 12,
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.text.muted,
  },
  emergencyBadge: {
    backgroundColor: colors.status.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emergencyText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  announcementContent: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  typeTag: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});