import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import createAgoraRtcEngine, { ChannelProfileType, ClientRoleType } from 'react-native-agora';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AGORA_APP_ID } from './agoraConfig';

const CHANNEL_NAME = "main_room";

export default function App() {
  const [engine, setEngine] = useState(null);
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  // تهيئة محرك Agora عند فتح التطبيق
  useEffect(() => {
    const initAgora = async () => {
      try {
        const agoraEngine = createAgoraRtcEngine();
        agoraEngine.initialize({ appId: AGORA_APP_ID });
        agoraEngine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
        setEngine(agoraEngine);
      } catch (e) {
        console.error(e);
      }
    };
    initAgora();
  }, []);

  // الاستماع للرسائل الحية من Firebase
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // الانضمام للغرفة الصوتية
  const joinChannel = async () => {
    if (engine) {
      engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      engine.joinChannel('', CHANNEL_NAME, 0, {});
      setJoined(true);
    }
  };

  // مغادرة الغرفة الصوتية
  const leaveChannel = () => {
    if (engine) {
      engine.leaveChannel();
      setJoined(false);
    }
  };

  // إرسال رسالة إلى Firebase
  const sendMessage = async () => {
    if (text.trim()) {
      await addDoc(collection(db, "messages"), {
        text,
        createdAt: new Date(),
      });
      setText('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الغرفة الصوتية المباشرة</Text>
      
      <View style={styles.voiceSection}>
        {!joined ? (
          <Button title="انضمام للغرفة الصوتية" onPress={joinChannel} />
        ) : (
          <Button title="مغادرة الغرفة" color="red" onPress={leaveChannel} />
        )}
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.msgContainer}>
            <Text style={styles.msg}>{item.text}</Text>
          </View>
        )}
        style={styles.chatBox}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="اكتب رسالة..."
        />
        <Button title="إرسال" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  voiceSection: { marginBottom: 15 },
  chatBox: { flex: 1, marginBottom: 10 },
  msgContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 },
  msg: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 10, backgroundColor: '#fff' }
});
          
