import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

const InputField = ({ label, value, onChangeText, keyboardType = 'default', autoCapitalize = 'words', showClear = true }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.floatingLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
    {showClear && value ? (
      <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
        <Ionicons name="close" size={20} color="#666" />
      </TouchableOpacity>
    ) : null}
  </View>
);

export default function AddContactScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    birthday: '',
    state: '',
    city: '',
    street: '',
    zipcode: '',
    image: ''
  });
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: new Date()
      });
      router.back();
    } catch (error) {
      console.error('Error adding contact: ', error);
      Alert.alert('Error', 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
            <Ionicons name="chevron-back" size={24} color="#8A2BE2" />
            <Text style={styles.cancelButton}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add new contact</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.headerRight}>
            <Ionicons name="checkmark" size={28} color={saving ? "#ccc" : "#8A2BE2"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity style={styles.profilePlaceholder} onPress={pickImage}>
            {(formData as any).image ? (
              <Image source={{ uri: (formData as any).image }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={80} color="#999" />
            )}
            <Text style={styles.setPhotoText}>Set Photo</Text>
          </TouchableOpacity>

          <View style={styles.sectionRow}>
            <Ionicons name="person" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="First Name" value={formData.firstName} onChangeText={(t: string) => setFormData({...formData, firstName: t})} />
              <InputField label="Last Name" value={formData.lastName} onChangeText={(t: string) => setFormData({...formData, lastName: t})} />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="call" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="Phone" value={formData.phone} keyboardType="phone-pad" onChangeText={(t: string) => setFormData({...formData, phone: t})} />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="mail" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="Email" value={formData.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(t: string) => setFormData({...formData, email: t})} />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="business" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="Company" value={formData.company} onChangeText={(t: string) => setFormData({...formData, company: t})} />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="calendar" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              {Platform.OS === 'web' ? (
                <InputField label="Birthday (YYYY-MM-DD)" value={formData.birthday} onChangeText={(t: string) => setFormData({...formData, birthday: t})} />
              ) : (
                <TouchableOpacity onPress={() => {
                  Keyboard.dismiss();
                  setShowDatePicker(true);
                }} style={styles.inputWrapper}>
                  <Text style={styles.floatingLabel}>Birthday</Text>
                  <View style={[styles.input, { justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 16, color: formData.birthday ? '#333' : '#999' }}>
                      {formData.birthday || 'Select Date'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="map" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="State" value={formData.state} onChangeText={(t: string) => setFormData({...formData, state: t})} />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="business" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="City" value={formData.city} onChangeText={(t: string) => setFormData({...formData, city: t})} />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="location" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="Street" value={formData.street} onChangeText={(t: string) => setFormData({...formData, street: t})} />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="mail-open" size={24} color="#8A2BE2" style={styles.sectionIcon} />
            <View style={styles.fieldsCol}>
              <InputField label="Zip Code" value={(formData as any).zipcode} keyboardType="number-pad" onChangeText={(t: string) => setFormData({...formData as any, zipcode: t})} />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.clearAllButton} 
            onPress={() => {
              setFormData({ firstName: '', lastName: '', phone: '', email: '', company: '', birthday: '', state: '', city: '', street: '', zipcode: '', image: '' } as any);
              setShowDatePicker(false);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.clearAllText}>Clear All Fields</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={formData.birthday ? new Date(formData.birthday) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event: any, selectedDate: any) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, birthday: selectedDate.toISOString().split('T')[0] });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5FC',
  },
  container: {
    flex: 1,
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
    width: 80,
  },
  headerRight: {
    alignItems: 'flex-end',
    width: 80,
  },
  cancelButton: {
    color: '#8A2BE2',
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profilePlaceholder: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  setPhotoText: {
    marginTop: 8,
    color: '#8A2BE2',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 15,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  sectionIcon: {
    width: 30,
    marginTop: 20,
    marginRight: 10,
  },
  fieldsCol: {
    flex: 1,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginVertical: 8,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 10,
    backgroundColor: '#F5F5FC',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#666',
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 10,
  },
  clearAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  clearAllText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});
