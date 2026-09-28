import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  const rooms = [
    { id: 1, name: '🎤 غرفة السوالف والدردشة', users: '12/20', category: 'عام' },
    { id: 2, name: '🎵 غرفة الأغاني والموسيقى', users: '8/15', category: 'فن' },
    { id: 3, name: '🎮 جيمينج وألعاب', users: '5/10', category: 'ألعاب' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>أهلاً بك 👋</Text>
          <Text style={styles.appName}>Snaybr51 Rooms</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🏰 الغرف الصوتية المتاحة</Text>
      
      <ScrollView style={styles.roomList} showsVerticalScrollIndicator={false}>
        {rooms.map((room) => (
          <TouchableOpacity 
            key={room.id} 
            style={[styles.roomCard, activeRoom === room.id && styles.activeRoomCard]}
            onPress={() => setActiveRoom(room.id)}
          >
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomCategory}>{room.category}</Text>
            </View>
            <View style={styles.roomBadge}>
              <Text style={styles.roomUsers}>👥 {room.users}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.micControlPanel}>
        <Text style={styles.micStatusText}>
          {activeRoom ? `متصل بالغرفة رقم #${activeRoom}` : 'اختر غرفة للانضمام'}
        </Text>
        
        <View style={styles.micButtonsRow}>
          <TouchableOpacity 
            style={[styles.micButton, isMuted ? styles.micMuted : styles.micActive]} 
            onPress={() => setIsMuted(!isMuted)}
          >
            <Text style={styles.micIconText}>
              {isMuted ? '🎙️❌' : '🎙️✨'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.micLabel}>
          {isMuted ? 'المايك مكتوم' : 'المايك يعمل (تحدث الآن)'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fceee3',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a3b32',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a3b32',
    marginBottom: 10,
  },
  roomList: {
    flex: 1,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeRoomCard: {
    borderColor: '#ff94b8',
    backgroundColor: '#fff0f5',
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  roomCategory: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  roomBadge: {
    backgroundColor: '#fceee3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  roomUsers: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a3b32',
  },
  micControlPanel: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  micStatusText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  micButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  micActive: {
    backgroundColor: '#4CAF50',
  },
  micMuted: {
    backgroundColor: '#E53935',
  },
  micIconText: {
    fontSize: 30,
  },
  micLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#4a3b32',
  },
});
    
