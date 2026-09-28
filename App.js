import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Alert 
} from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeRoom, setActiveRoom] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [mySeat, setMySeat] = useState(1); // المقعد الحالي للمستخدم
  const [coins, setCoins] = useState(1250); // رصيد النقاط/العملات

  // قائمة الغرف المتاحة
  const rooms = [
    { id: 1, name: '👑 غرفة السوالف والدردشة الكبرى', host: 'المايسترو', users: '18/20', category: 'عام' },
    { id: 2, name: '🎵 رواد الموسيقى والطرب', host: 'سارة', users: '12/15', category: 'موسيقى' },
    { id: 3, name: '🎮 تحديات الجيمينج والألعاب', host: 'سنايبر', users: '8/10', category: 'ألعاب' },
    { id: 4, name: '☕ مقهى الأصدقاء والتواصل', host: 'أحمد', users: '5/12', category: 'عام' },
  ];

  // المقاعد الصوتية على المسرح (8 مقاعد)
  const [seats, setSeats] = useState([
    { id: 1, name: 'أنت', isMuted: false, isHost: true, avatar: '👑' },
    { id: 2, name: 'سارة', isMuted: true, isHost: false, avatar: '🎧' },
    { id: 3, name: 'أحمد', isMuted: false, isHost: false, avatar: '🎙️' },
    { id: 4, name: 'فارغ', isEmpty: true },
    { id: 5, name: 'فارغ', isEmpty: true },
    { id: 6, name: 'فارغ', isEmpty: true },
    { id: 7, name: 'فارغ', isEmpty: true },
    { id: 8, name: 'فارغ', isEmpty: true },
  ]);

  // الهدايا المتاحة
  const gifts = [
    { id: 1, name: 'وردة', icon: '🌹', price: 10 },
    { id: 2, name: 'سيارة', icon: '🏎️', price: 100 },
    { id: 3, name: 'تاج', icon: '👑', price: 300 },
    { id: 4, name: 'ماسة', icon: '💎', price: 500 },
  ];

  // دالة حجز المقعد أو مغادرته
  const toggleSeat = (seatId) => {
    if (mySeat === seatId) {
      setMySeat(null);
      Alert.alert('المسرح', 'لقد غادرت مقعد المايك');
    } else {
      setMySeat(seatId);
      Alert.alert('المسرح', `تم انضمامك للمقعد رقم #${seatId}`);
    }
  };

  // دالة إرسال الهدايا
  const sendGift = (gift) => {
    if (coins >= gift.price) {
      setCoins(coins - gift.price);
      Alert.alert('إرسال هدية 🎁', `تم إرسال ${gift.name} ${gift.icon} بنجاح!`);
    } else {
      Alert.alert('رصيد غير كافٍ', 'يرجى شحن العملات لإرسال هذه الهدية.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* الهيدر العلوي والمعلومات الشخصية */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>أهلاً بك 👋</Text>
          <Text style={styles.appName}>Snaybr51 VIP Rooms</Text>
        </View>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>💰 {coins}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* شريط التصنيفات */}
        <View style={styles.tabContainer}>
          {['all', 'موسيقى', 'ألعاب'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'all' ? '🌐 جميع الغرف' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* عرض الغرفة النشطة الحالية (عرض المسرح والمقاعد) */}
        <View style={styles.activeRoomStage}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageTitle}>
              🏰 الغرفة الحالية #{activeRoom}
            </Text>
            <TouchableOpacity style={styles.leaveRoomButton} onPress={() => Alert.alert('غرفة', 'تم الخروج من الغرفة')}>
              <Text style={styles.leaveRoomText}>🚪 خروج</Text>
            </TouchableOpacity>
          </View>

          {/* شبكة المقاعد الـ 8 */}
          <Text style={styles.stageSubtitle}>🎙️ مقاعد المتحدثين على المسرح</Text>
          <View style={styles.seatsGrid}>
            {seats.map((seat) => (
              <TouchableOpacity
                key={seat.id}
                style={[
                  styles.seatCard,
                  mySeat === seat.id && styles.mySeatCard,
                  seat.isEmpty && styles.emptySeatCard
                ]}
                onPress={() => toggleSeat(seat.id)}
              >
                <Text style={styles.seatAvatar}>
                  {seat.isEmpty ? '➕' : seat.avatar || '👤'}
                </Text>
                <Text style={styles.seatName} numberOfLines={1}>
                  {seat.isEmpty ? `مقعد ${seat.id}` : seat.name}
                </Text>
                {!seat.isEmpty && (
                  <Text style={styles.seatMicStatus}>
                    {seat.isMuted ? '🔇' : '🎙️'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* متجر الهدايا السريع */}
          <Text style={styles.giftSectionTitle}>🎁 إرسال هدايا للغرفة</Text>
          <View style={styles.giftsRow}>
            {gifts.map((gift) => (
              <TouchableOpacity
                key={gift.id}
                style={styles.giftCard}
                onPress={() => sendGift(gift)}
              >
                <Text style={styles.giftIcon}>{gift.icon}</Text>
                <Text style={styles.giftName}>{gift.name}</Text>
                <Text style={styles.giftPrice}>{gift.price} 🪙</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* قائمة الغرف المتاحة للانضمام */}
        <Text style={styles.sectionTitle}>📋 قائمة الغرف المتاحة</Text>
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[styles.roomCard, activeRoom === room.id && styles.activeRoomCard]}
            onPress={() => setActiveRoom(room.id)}
          >
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomCategory}>المضيف: {room.host} | القسم: {room.category}</Text>
            </View>
            <View style={styles.roomBadge}>
              <Text style={styles.roomUsers}>👥 {room.users}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* لوحة التحكم بالمايك والتفاعل المباشر بالأصل */}
      <View style={styles.bottomControlBar}>
        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم إرسال ❤️')}>
          <Text style={styles.actionIconText}>❤️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم رفع اليد ✋')}>
          <Text style={styles.actionIconText}>✋</Text>
        </TouchableOpacity>

        {/* زر المايك الرئيسي */}
        <TouchableOpacity
          style={[styles.mainMicButton, isMuted ? styles.micMutedBg : styles.micActiveBg]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Text style={styles.mainMicIcon}>
            {isMuted ? '🎙️❌' : '🎙️✨'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم إرسال 🎉')}>
          <Text style={styles.actionIconText}>🎉</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم إرسال 🔥')}>
          <Text style={styles.actionIconText}>🔥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fceee3',
    paddingTop: 45,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'column',
  },
  welcomeText: {
    fontSize: 12,
    color: '#888',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a3b32',
  },
  coinBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  coinText: {
    fontWeight: 'bold',
    color: '#856404',
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: '#ff94b8',
  },
  tabText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  activeRoomStage: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a3b32',
  },
  leaveRoomButton: {
    backgroundColor: '#ffe5e5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  leaveRoomText: {
    color: '#d9534f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stageSubtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 12,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seatCard: {
    width: '22%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  mySeatCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  emptySeatCard: {
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  seatAvatar: {
    fontSize: 22,
    marginBottom: 4,
  },
  seatName: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
  },
  seatMicStatus: {
    fontSize: 10,
    marginTop: 2,
  },
  giftSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a3b32',
    marginTop: 10,
    marginBottom: 10,
  },
  giftsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  giftCard: {
    width: '23%',
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  giftIcon: {
    fontSize: 22,
  },
  giftName: {
    fontSize: 11,
    color: '#333',
    marginTop: 2,
  },
  giftPrice: {
    fontSize: 10,
    color: '#f57c00',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a3b32',
    marginBottom: 10,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRoomCard: {
    borderWidth: 1.5,
    borderColor: '#ff94b8',
  },
  roomName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  roomCategory: {
    fontSize: 11,
    color: '#888',
    marginTop: 3,
  },
  roomBadge: {
    backgroundColor: '#fceee3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roomUsers: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a3b32',
  },
  bottomControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 10,
    elevation: 5,
  },
  actionIconButton: {
    padding: 8,
  },
  actionIconText: {
    fontSize: 22,
  },
  mainMicButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  micActiveBg: {
    backgroundColor: '#4CAF50',
  },
  micMutedBg: {
    backgroundColor: '#E53935',
  },
  mainMicIcon: {
    fontSize: 26,
  },
});
                  
