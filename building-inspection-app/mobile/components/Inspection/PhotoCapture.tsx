import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Photo } from '../../types';
import { Colors, Radius, Spacing } from '../../utils/theme';
import { generatePhotoCaption } from '../../services/api';
import { generateId } from '../../utils/id';

interface Props {
  categoryName: string;
  photos: Photo[];
  onPhotoAdded: (photo: Photo) => void;
  onPhotoUpdated: (photoId: string, changes: Partial<Photo>) => void;
  onPhotoDeleted: (photoId: string) => void;
}

async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const PhotoCapture: React.FC<Props> = ({
  categoryName, photos, onPhotoAdded, onPhotoUpdated, onPhotoDeleted,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleImage = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    const photo: Photo = {
      id: generateId(),
      uri: asset.uri,
      mediaType: asset.mimeType ?? 'image/jpeg',
      caption: '',
      captionLoading: true,
      timestamp: new Date().toISOString(),
    };
    onPhotoAdded(photo);

    try {
      const base64 = await uriToBase64(asset.uri);
      const caption = await generatePhotoCaption(base64, photo.mediaType, categoryName);
      onPhotoUpdated(photo.id, { caption, captionLoading: false });
    } catch {
      onPhotoUpdated(photo.id, {
        caption: `Kuva kohteesta: ${categoryName}`,
        captionLoading: false,
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ei lupaa', 'Kamera-lupa tarvitaan kuvien ottamiseen.');
      return;
    }
    setUploading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.75,
        exif: false,
      });
      await handleImage(result);
    } finally {
      setUploading(false);
    }
  };

  const pickPhoto = async () => {
    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.75,
      });
      await handleImage(result);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = (photoId: string) => {
    Alert.alert('Poista kuva', 'Haluatko varmasti poistaa tämän kuvan?', [
      { text: 'Peruuta', style: 'cancel' },
      { text: 'Poista', style: 'destructive', onPress: () => onPhotoDeleted(photoId) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={takePhoto} disabled={uploading}>
          <Ionicons name="camera-outline" size={18} color={Colors.primary} />
          <Text style={styles.btnText}>Ota kuva</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={pickPhoto} disabled={uploading}>
          <Ionicons name="image-outline" size={18} color={Colors.primary} />
          <Text style={styles.btnText}>Galleria</Text>
        </TouchableOpacity>
        {uploading && <ActivityIndicator color={Colors.primary} />}
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {photos.map(photo => (
            <View key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: photo.uri }} style={styles.photoImg} />
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(photo.id)}
              >
                <Ionicons name="close-circle" size={22} color={Colors.danger} />
              </TouchableOpacity>
              <View style={styles.captionBox}>
                {photo.captionLoading ? (
                  <View style={styles.captionLoading}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.captionLoadingText}>AI tunnistaa...</Text>
                  </View>
                ) : (
                  <Text style={styles.captionText} numberOfLines={2}>
                    {photo.caption || 'Ei kuvatekstiä'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  scroll: { marginTop: Spacing.xs },
  photoCard: {
    width: 160,
    marginRight: Spacing.sm,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoImg: { width: 160, height: 110, resizeMode: 'cover' },
  deleteBtn: { position: 'absolute', top: 4, right: 4 },
  captionBox: { padding: 8, minHeight: 42 },
  captionLoading: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  captionLoadingText: { fontSize: 11, color: Colors.primary },
  captionText: { fontSize: 11, color: Colors.textSecondary, lineHeight: 15 },
});
