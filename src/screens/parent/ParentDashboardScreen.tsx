import React, { useState } from 'react';
import { auth, db } from '../../services/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

// --- Types for Backend Integration ---

export type ChildSummary = {
  name: string;
  avatarUrl?: string;
  streak: number;
  levelTitle: string;
  totalActions: number;
  treesPlanted: number;
  carbonSavedKg: number;
};

export type AILog = {
  id: string;
  title: string;
  timeText: string;
  status: 'success' | 'warning' | 'error';
};

export type RecentActivity = {
  id: string;
  title: string;
  points: number;
  timeText: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
};

// --- Mock Data ---

const initialChild: ChildSummary = {
  name: 'Leo',
  streak: 14,
  levelTitle: 'Level 5 Explorer',
  totalActions: 128,
  treesPlanted: 3,
  carbonSavedKg: 45,
};

const mockAiLogs: AILog[] = [
  { id: '1', title: 'Recycling Bin Sorted', timeText: 'Today, 2:30 PM • 98% Match', status: 'success' },
  { id: '2', title: 'Watered Garden', timeText: 'Yesterday, 9:15 AM • 95% Match', status: 'success' },
  { id: '3', title: 'Compost Added', timeText: 'Oct 12, 4:00 PM • Manual Review Needed', status: 'warning' },
];

const mockActivities: RecentActivity[] = [
  { 
    id: '1', 
    title: 'Cleaned Local Park', 
    points: 50, 
    timeText: '2 hours ago', 
    icon: '🧹', 
    iconBgColor: 'rgba(56, 173, 50, 0.2)', 
    iconColor: '#38ad32' 
  },
  { 
    id: '2', 
    title: 'Walked to School', 
    points: 20, 
    timeText: 'Yesterday', 
    icon: '🚶', 
    iconBgColor: 'rgba(148, 246, 139, 0.3)', 
    iconColor: '#006e17' 
  },
];

export default function ParentDashboardScreen({ navigation }: any) {
  const [notificationsDisabled, setNotificationsDisabled] = useState(false);
  const [childName, setChildName] = useState(initialChild.name);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(initialChild.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleReturnToGarden = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  const handleEditName = () => {
    setTempName(childName);
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    if (tempName.trim() === '') {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'Not signed in.');
      return;
    }

    setIsUpdating(true);
    setIsEditing(false);

    try {
      await updateDoc(doc(db, 'children', uid), {
        nickname: tempName.trim(),
      });
      setChildName(tempName.trim());
    } catch (error) {
      console.error('Failed to update name:', error);
      Alert.alert('Error', 'Could not update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Top App Bar */}
      <View style={styles.topAppBar}>
        <TouchableOpacity style={styles.backToGardenBtn} onPress={handleReturnToGarden}>
          <Text style={styles.backIcon}>🏡</Text>
          <Text style={styles.backText}>Garden</Text>
        </TouchableOpacity>
        
        <Text style={styles.appBarTitle}>GreenPulse</Text>
        
        <TouchableOpacity style={styles.appBarIcon}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Parent Dashboard</Text>
          <Text style={styles.pageSubtitle}>Overview of {childName}'s activities and safety settings.</Text>
        </View>

        <View style={styles.cardsContainer}>
          
          {/* Child Summary Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderTop}>
              <View style={styles.childInfoContainer}>
                <View style={styles.childAvatar}>
                  <Text style={{ fontSize: 32 }}>👦</Text>
                </View>
                <View style={styles.childInfoText}>
                  {isEditing ? (
                    <View style={styles.editInputContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={tempName}
                        onChangeText={setTempName}
                        autoFocus
                        placeholder="Enter name"
                      />
                      <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.nameRow}>
                      <Text style={styles.childName}>{childName}</Text>
                      {isUpdating && <ActivityIndicator size="small" color="#006e09" style={{ marginLeft: 8 }} />}
                    </View>
                  )}
                  
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeIconWarning}>🔥</Text>
                      <Text style={styles.badgeText}>{initialChild.streak} Day Streak</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeIconPrimary}>🌿</Text>
                      <Text style={styles.badgeText}>{initialChild.levelTitle}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {!isEditing && (
                <TouchableOpacity style={styles.editButton} onPress={handleEditName}>
                  <Text style={{ fontSize: 18, color: '#68756B' }}>✏️</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TOTAL ACTIONS</Text>
                <Text style={styles.statValue}>{initialChild.totalActions}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TREES PLANTED</Text>
                <Text style={styles.statValue}>{initialChild.treesPlanted}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>CARBON SAVED</Text>
                <Text style={styles.statValue}>{initialChild.carbonSavedKg}kg</Text>
              </View>
            </View>
          </View>

          {/* AI Verification Logs */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>AI Logs</Text>
              <Text style={{ fontSize: 20 }}>🛡️</Text>
            </View>
            <Text style={styles.cardSubtitle}>Recent photo verifications of completed tasks.</Text>
            
            <View style={styles.logsContainer}>
              {mockAiLogs.map((log, index) => {
                const isLast = index === mockAiLogs.length - 1;
                const isSuccess = log.status === 'success';
                
                return (
                  <View key={log.id} style={[styles.logItem, isLast && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <View style={[
                      styles.logIconContainer, 
                      isSuccess 
                        ? { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.2)' }
                        : { backgroundColor: 'rgba(244, 180, 0, 0.1)', borderColor: 'rgba(244, 180, 0, 0.2)' }
                    ]}>
                      <Text style={{ color: isSuccess ? '#4CAF50' : '#F4B400', fontWeight: 'bold' }}>
                        {isSuccess ? '✓' : '?'}
                      </Text>
                    </View>
                    <View style={styles.logTextContainer}>
                      <Text style={styles.logTitle}>{log.title}</Text>
                      <Text style={styles.logTime}>{log.timeText}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Recent Activities */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Activities</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activitiesContainer}>
              {mockActivities.map((activity) => (
                <TouchableOpacity key={activity.id} style={styles.activityItem} activeOpacity={0.7}>
                  <View style={[styles.activityIconContainer, { backgroundColor: activity.iconBgColor }]}>
                    <Text style={{ fontSize: 20 }}>{activity.icon}</Text>
                  </View>
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>+{activity.points} XP • {activity.timeText}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Safety & Settings */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Safety & Settings</Text>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Disable Notifications</Text>
                <Text style={styles.settingDesc}>Pause all alerts for {childName}'s device.</Text>
              </View>
              <Switch 
                value={notificationsDisabled}
                onValueChange={setNotificationsDisabled}
                trackColor={{ false: '#dee5d6', true: '#38ad32' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <Text style={styles.dangerDesc}>
                Permanently delete this child account and all associated data. This action cannot be undone.
              </Text>
              <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8}>
                <Text style={styles.deleteButtonIcon}>🗑️</Text>
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Bottom Navigation Shortcut */}
        <TouchableOpacity 
          style={styles.bottomGardenBtn} 
          onPress={handleReturnToGarden}
          activeOpacity={0.8}
        >
          <Text style={styles.bottomGardenIcon}>🏡</Text>
          <Text style={styles.bottomGardenText}>Return to Main Garden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F6F7F2',
    zIndex: 10,
  },
  backToGardenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E1D3',
  },
  backIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006e09',
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
    flex: 1,
    textAlign: 'center',
    marginRight: 20,
  },
  appBarIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    flexGrow: 1,
  },
  bottomGardenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#006e09',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  bottomGardenIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  bottomGardenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006e09',
  },
  pageHeader: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Ensure it takes up space but allows the edit button to stay visible
    marginRight: 12,
  },
  childAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 173, 50, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(56, 173, 50, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  childInfoText: {
    justifyContent: 'center',
    flex: 1, // Allow text to wrap if needed
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E1D3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  editInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2A1F',
    flex: 1,
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#006e09',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E1D3',
  },
  badgeIconWarning: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeIconPrimary: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#68756B',
  },
  editButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#E8F5E9', // Light green background for better visibility
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#EEF2EA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#68756B',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#006e09',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#68756B',
    marginBottom: 20,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006e09',
  },
  logsContainer: {
    width: '100%',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 225, 211, 0.4)',
  },
  logIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 16,
  },
  logTextContainer: {
    flex: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  logTime: {
    fontSize: 11,
    color: '#68756B',
    marginTop: 2,
  },
  activitiesContainer: {
    gap: 12,
    marginTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2EA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  activityTime: {
    fontSize: 14,
    color: '#68756B',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  settingDesc: {
    fontSize: 14,
    color: '#68756B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216, 225, 211, 0.6)',
    marginVertical: 24,
  },
  dangerZone: {
    width: '100%',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E35D5D',
    marginBottom: 4,
  },
  dangerDesc: {
    fontSize: 14,
    color: '#68756B',
    marginBottom: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 218, 214, 0.3)',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  deleteButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ba1a1a',
  }
});
