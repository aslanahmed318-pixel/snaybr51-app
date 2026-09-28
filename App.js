import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image,
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  Alert 
} from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeRoom, setActiveRoom] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [mySeat, setMySeat] = useState(1);
  
  // رصيد 10 مليار عملة افتراضية 💰
  const [coins, setCoins] = useState(10000000000);

  // حالات النوافذ المنبثقة (Modals)
  const [profileVisible, setProfileVisible] = useState(false);
  const [createRoomVisible, setCreateRoomVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // الشات المباشر داخل الغرفة
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'سارة', text: 'أهلاً بالجميع في الغرفة! 👋' },
    { id: 2, sender: 'أحمد', text: 'صوت المايك ممتاز جداً ✨' },
    { id: 3, sender: 'النظام', text: '🎁 قام أحمد بإرسال وردة إلى سارة!' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // قائمة الغرف المتاحة
  const [rooms, setRooms] = useState([
    { id: 1, name: '👑 غرفة السوالف والدردشة الكبرى', host: 'المايسترو', users: '18/20', category: 'عام' },
    { id: 2, name: '🎵 رواد الموسيقى والطرب', host: 'سارة', users: '12/15', category: 'موسيقى' },
    { id: 3, name: '🎮 تحديات الجيمينج والألعاب', host: 'سنايبر', users: '8/10', category: 'ألعاب' },
  ]);

  // مقاعد المتحدثين الـ 8
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

  // تنسيق الأرقام الكبيرة
  const formatCoins = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(0) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M';
    }
    return num.toLocaleString();
  };

  // إرسال رسالة شات
  const sendMessage = () => {
    if (inputMessage.trim() === '') return;
    setChatMessages([...chatMessages, { id: Date.now(), sender: 'أنت', text: inputMessage }]);
    setInputMessage('');
  };

  // تغيير المقعد
  const toggleSeat = (seatId) => {
    if (mySeat === seatId) {
      setMySeat(null);
      Alert.alert('المسرح', 'لقد نزلتم من المقعد.');
    } else {
      setMySeat(seatId);
      Alert.alert('المسرح', `تم انضمامك للمقعد #${seatId}`);
    }
  };

  // إرسال هدية
  const sendGift = (gift) => {
    if (coins >= gift.price) {
      setCoins(coins - gift.price);
      setChatMessages([
        ...chatMessages, 
        { id: Date.now(), sender: 'النظام', text: `🎁 أرسلت ${gift.name} ${gift.icon} للغرفة!` }
      ]);
      Alert.alert('إرسال هدية 🎁', `تم إرسال ${gift.name} ${gift.icon}`);
    } else {
      Alert.alert('رصيد غير كافٍ', 'يرجى شحن النقاط أولاً.');
    }
  };

  // إنشاء غرفة جديدة
  const createRoom = () => {
    if (newRoomName.trim() === '') return;
    const newRoom = {
      id: rooms.length + 1,
      name: `🏰 ${newRoomName}`,
      host: 'أنت',
      users: '1/15',
      category: 'عام'
    };
    setRooms([newRoom, ...rooms]);
    setActiveRoom(newRoom.id);
    setCreateRoomVisible(false);
    setNewRoomName('');
    Alert.alert('تم بنجاح', 'تم إنشاء غرفتك الخاصة بنجاح!');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* الهيدر العلوي مع الصورة ورصيد الـ 10 مليار */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfoRow} onPress={() => setProfileVisible(true)}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }} 
            style={styles.avatarImage} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>👑 الحساب الشخصي</Text>
            <Text style={styles.appName}>Snaybr51 VIP Rooms ⚙️</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.coinBadge} onPress={() => Alert.alert('رصيد الحساب', `رصيدك الحالي: ${coins.toLocaleString()} عملة`)}>
          <Text style={styles.coinText}>💰 {formatCoins(coins)} ➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* شريط التصنيفات وزر إنشاء غرفة */}
        <View style={styles.topActionsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
            {['all', 'موسيقى', 'ألعاب'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab === 'all' ? '🌐 الجميع' : tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.createRoomBtn} onPress={() => setCreateRoomVisible(true)}>
            <Text style={styles.createRoomBtnText}>➕ إنشاء غرفة</Text>
          </TouchableOpacity>
        </View>

        {/* واجهة الغرفة والمسرح */}
        <View style={styles.activeRoomStage}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageTitle}>🏰 الغرفة الحالية #{activeRoom}</Text>
            <View style={styles.stageHeaderControls}>
              <TouchableOpacity 
                style={styles.speakerToggleBtn} 
                onPress={() => setIsSpeakerMuted(!isSpeakerMuted)}
              >
                <Text style={styles.speakerText}>{isSpeakerMuted ? '🔇 مكتوم' : '🔊 صوت'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* المقاعد الـ 8 */}
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
                <Text style={styles.seatAvatar}>{seat.isEmpty ? '➕' : seat.avatar || '👤'}</Text>
                <Text style={styles.seatName} numberOfLines={1}>{seat.isEmpty ? `مقعد ${seat.id}` : seat.name}</Text>
                {!seat.isEmpty && (
                  <Text style={styles.seatMicStatus}>{seat.isMuted ? '🔇' : '🎙️'}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* الشات المباشر داخل الغرفة */}
          <Text style={styles.giftSectionTitle}>💬 المحادثة المباشرة للغرفة</Text>
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatScrollView} nestedScrollEnabled={true}>
              {chatMessages.map((msg) => (
                <Text key={msg.id} style={styles.chatMsgText}>
                  <Text style={styles.chatSender}>{msg.sender}: </Text>
                  {msg.text}
                </Text>
              ))}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="اكتب رسالة..."
                value={inputMessage}
                onChangeText={setInputMessage}
              />
              <TouchableOpacity style={styles.sendChatBtn} onPress={sendMessage}>
                <Text style={styles.sendChatBtnText}>إرسال</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* متجر الهدايا السريع */}
          <Text style={styles.giftSectionTitle}>🎁 إرسال هدايا</Text>
          <View style={styles.giftsRow}>
            {gifts.map((gift) => (
              <TouchableOpacity key={gift.id} style={styles.giftCard} onPress={() => sendGift(gift)}>
                <Text style={styles.giftIcon}>{gift.icon}</Text>
                <Text style={styles.giftName}>{gift.name}</Text>
                <Text style={styles.giftPrice}>{gift.price} 🪙</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* قائمة الغرف */}
        <Text style={styles.sectionTitle}>📋 استكشف الغرف المتاحة</Text>
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

      {/* لوحة التحكم والمايك والتفاعلات السفلية */}
      <View style={styles.bottomControlBar}>
        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم إرسال ❤️')}>
          <Text style={styles.actionIconText}>❤️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم رفع اليد ✋')}>
          <Text style={styles.actionIconText}>✋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainMicButton, isMuted ? styles.micMutedBg : styles.micActiveBg]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Text style={styles.mainMicIcon}>{isMuted ? '🎙️❌' : '🎙️✨'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم إرسال 🎉')}>
          <Text style={styles.actionIconText}>🎉</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIconButton} onPress={() => Alert.alert('تفاعل', 'تم إرسال 🔥')}>
          <Text style={styles.actionIconText}>🔥</Text>
        </TouchableOpacity>
      </View>

      {/* نافذة البروفايل (Modal) */}
      <Modal visible={profileVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👤 ملفك الشخصي</Text>
            <Text style={styles.modalSubtitle}>ID: 51519090</Text>
            <Text style={styles.modalDetail}>الرتبة: VIP 🌟</Text>
            <Text style={styles.modalDetail}>رصيد العملات: {coins.toLocaleString()} 🪙</Text>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setProfileVisible(false)}>
              <Text style={styles.closeModalBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* نافذة إنشاء غرفة جديدة (Modal) */}
      <Modal visible={createRoomVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏰 إنشاء غرفة صوتية جديد</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="ادخل اسم الغرفة..."
              value={newRoomName}
              onChangeText={setNewRoomName}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.confirmBtn} onPress={createRoom}>
                <Text style={styles.confirmBtnText}>تم الإنشاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateRoomVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  userInfo: {
    flexDirection: 'column',
  },
  welcomeText: {
    fontSize: 11,
    color: '#888',
  },
  appName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4a3b32',
  },
  coinBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  coinText: {
    fontWeight: 'bold',
    color: '#856404',
    fontSize: 12,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    maxWidth: '65%',
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  activeTabButton: {
    backgroundColor: '#ff94b8',
  },
  tabText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  createRoomBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  createRoomBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeRoomStage: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageHeaderControls: {
    flexDirection: 'row',
  },
  speakerToggleBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  speakerText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  stageTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4a3b32',
  },
  stageSubtitle: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
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
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 20,
    marginBottom: 2,
  },
  seatName: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  seatMicStatus: {
    fontSize: 9,
    marginTop: 2,
  },
  chatContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    maxHeight: 130,
  },
  chatScrollView: {
    maxHeight: 70,
    marginBottom: 5,
  },
  chatMsgText: {
    fontSize: 11,
    color: '#444',
    marginBottom: 3,
  },
  chatSender: {
    fontWeight: 'bold',
    color: '#d81b60',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendChatBtn: {
    backgroundColor: '#ff94b8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 6,
  },
  sendChatBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  giftSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4a3b32',
    marginTop: 10,
    marginBottom: 8,
  },
  giftsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  giftCard: {
    width: '23%',
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  giftIcon: {
    fontSize: 20,
  },
  giftName: {
    fontSize: 10,
    color: '#333',
  },
  giftPrice: {
    fontSize: 9,
    color: '#f57c00',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4a3b32',
    marginBottom: 8,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 15,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRoomCard: {
    borderWidth: 1.5,
    borderColor: '#ff94b8',
  },
  roomName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  roomCategory: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    elevation: 4,
  },
  actionIconButton: {
    padding: 6,
  },
  actionIconText: {
    fontSize: 20,
  },
  mainMicButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
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
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4a3b32',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 5,
  },
  modalDetail: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  closeModalBtn: {
    marginTop: 15,
    backgroundColor: '#ff94b8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  closeModalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  cancelBtnText: {
