import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDeleting = useRef(false);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'contacts', id as string);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setContact({ id: docSnap.id, ...docSnap.data() });
      } else if (!isDeleting.current) {
        // Document gone without user pressing delete — just navigate back
        router.replace('/');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching contact:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const calculateAge = (birthday: any) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDelete = () => {
    Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          isDeleting.current = true;
          try {
            await deleteDoc(doc(db, 'contacts', id as string));
            router.replace('/');
          } catch (error) {
            isDeleting.current = false;
            console.error('Error deleting contact:', error);
            Alert.alert('Error', 'Failed to delete contact');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#8A2BE2" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (!contact) return null;

  const age = calculateAge(contact.birthday);

  const DetailCard = ({ label, value, showCopy = false, iconName }: any) => {
    if (!value) return null;
    const isPurpleText = label === 'Phone' || label === 'Email';
    return (
      <View style={styles.cardContainer}>
        {iconName && (
          <Ionicons name={iconName} size={24} color="#8A2BE2" style={{ marginRight: 12 }} />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={[styles.cardValue, isPurpleText && { color: '#8A2BE2' }]}>{value}</Text>
        </View>
        {showCopy && (
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={20} color="#8A2BE2" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="chevron-back" size={24} color="#8A2BE2" />
          <Text style={styles.headerButtonText}>Edit contact</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit contact</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push(`/contact/edit/${id}`)} style={{ marginRight: 15 }}>
            <Ionicons name="pencil" size={22} color="#8A2BE2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="#8A2BE2" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {contact.image ? (
              <Image source={{ uri: contact.image }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {(contact.firstName?.[0] || '')}{(contact.lastName?.[0] || '')}
              </Text>
            )}
          </View>
          <Text style={styles.nameText}>
            {contact.firstName} {contact.lastName}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble" size={24} color="#8A2BE2" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call" size={24} color="#8A2BE2" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="mail" size={24} color="#8A2BE2" />
            <Text style={styles.actionButtonText}>Mail</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <DetailCard label="Phone" value={contact.phone} showCopy />
          <DetailCard label="Email" value={contact.email} showCopy />
          <DetailCard label="Company" value={contact.company} />
          {contact.birthday && (
            <DetailCard label="Birthday" value={`${contact.birthday} ${age !== null ? `(${age} years old)` : ''}`} />
          )}
          <DetailCard label="State" value={contact.state} />
          <DetailCard label="City" value={contact.city} />
          <DetailCard label="Street" value={contact.street} />
          <DetailCard label="Zip Code" value={contact.zipcode} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 100,
  },
  headerButtonText: {
    color: '#8A2BE2',
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  container: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1C4E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4B0082',
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#EAE0F5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '500',
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAE0F5',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: '#555',
  },
  copyButton: {
    padding: 5,
  }
});
