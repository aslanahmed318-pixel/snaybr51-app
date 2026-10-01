import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function MainScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.logo}>SNAYBR51</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.username}>مستخدم جديد</Text>
            <Text style={styles.userId}>ID: --</Text>
            <Text style={styles.vip}>VIP 0</Text>
          </View>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletTitle}>رصيد العملات 🪙</Text>
          <Text style={styles.coins}>2,000,000</Text>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate('Wallet')}
          >
            <Text style={styles.smallButtonText}>
              المحفظة
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          الوصول السريع
        </Text>

        <View style={styles.grid}>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Rooms')}
          >
            <Text style={styles.icon}>🎙️</Text>
            <Text style={styles.cardTitle}>الغرف</Text>
            <Text style={styles.cardText}>
              دخول الغرف الصوتية
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Store')}
          >
            <Text style={styles.icon}>🛒</Text>
            <Text style={styles.cardTitle}>المتجر</Text>
            <Text style={styles.cardText}>
              العملات و VIP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Games')}
          >
            <Text style={styles.icon}>🎮</Text>
            <Text style={styles.cardTitle}>الألعاب</Text>
            <Text style={styles.cardText}>
              الألعاب داخل التطبيق
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.icon}>👤</Text>
            <Text style={styles.cardTitle}>الحساب</Text>
            <Text style={styles.cardText}>
              الملف الشخصي
            </Text>
          </TouchableOpacity>

        </View>

        <View style={styles.vipCard}>
          <Text style={styles.vipIcon}>👑</Text>

          <View style={styles.vipInfo}>
            <Text style={styles.vipTitle}>
              نظام VIP
            </Text>

            <Text style={styles.vipText}>
              المميزات والإطارات ودخول الغرف
            </Text>
          </View>

          <TouchableOpacity
            style={styles.vipButton}
            onPress={() => navigation.navigate('Store')}
          >
            <Text style={styles.vipButtonText}>
              عرض
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={styles.bottomBar}>

        <TouchableOpacity
          style={styles.bottomItem}
        >
          <Text style={styles.bottomIcon}>🏠</Text>
          <Text style={styles.bottomText}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Rooms')}
        >
          <Text style={styles.bottomIcon}>🎙️</Text>
          <Text style={styles.bottomText}>الغرف</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Store')}
        >
          <Text style={styles.bottomIcon}>🛒</Text>
          <Text style={styles.bottomText}>المتجر</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.bottomIcon}>👤</Text>
          <Text style={styles.bottomText}>حسابي</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  avatarText: {
    fontSize: 32,
  },

  profileInfo: {
    flex: 1,
  },

  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },

  userId: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  vip: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },

  walletCard: {
    backgroundColor: '#222',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
  },

  walletTitle: {
    color: '#fff',
    fontSize: 16,
  },

  coins: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 8,
  },

  smallButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 9,
    borderRadius: 10,
  },

  smallButtonText: {
    color: '#222',
    fontWeight: 'bold',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    minHeight: 135,
  },

  icon: {
    fontSize: 30,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  cardText: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },

  vipCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  vipIcon: {
    fontSize: 35,
    marginRight: 12,
  },

  vipInfo: {
    flex: 1,
  },

  vipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  vipText: {
    color: '#777',
    marginTop: 5,
    fontSize: 13,
  },

  vipButton: {
    backgroundColor: '#222',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
  },

  vipButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  bottomItem: {
    alignItems: 'center',
  },

  bottomIcon: {
    fontSize: 22,
  },

  bottomText: {
    fontSize: 12,
    marginTop: 3,
    color: '#333',
  },
});
