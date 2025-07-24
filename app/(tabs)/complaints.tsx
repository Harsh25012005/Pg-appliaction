import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { AlertCircle, Plus, Camera, Upload, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useComplaint } from '@/store/complaint-store';
import { ComplaintType, ComplaintUrgency } from '@/types';
import * as ImagePicker from 'expo-image-picker';

export default function ComplaintsScreen() {
  const { complaints, pendingComplaints, inProgressComplaints, resolvedComplaints, addComplaint } = useComplaint();
  const [activeTab, setActiveTab] = useState(0);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintType, setComplaintType] = useState<ComplaintType>('Plumbing');
  const [complaintUrgency, setComplaintUrgency] = useState<ComplaintUrgency>('Medium');
  const [complaintImages, setComplaintImages] = useState<string[]>([]);
  
  const complaintTypes: ComplaintType[] = ['Plumbing', 'Electrical', 'Furniture', 'Cleanliness', 'WiFi', 'Other'];
  const urgencyLevels: ComplaintUrgency[] = ['Low', 'Medium', 'High'];
  
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };
  
  const handleAddComplaint = () => {
    setShowNewComplaint(true);
  };
  
  const handleCancelComplaint = () => {
    setShowNewComplaint(false);
    resetComplaintForm();
  };
  
  const handleSubmitComplaint = async () => {
    if (!complaintTitle.trim() || !complaintDescription.trim()) return;
    
    await addComplaint({
      title: complaintTitle,
      description: complaintDescription,
      type: complaintType,
      urgency: complaintUrgency,
      images: complaintImages,
    });
    
    setShowNewComplaint(false);
    resetComplaintForm();
  };
  
  const resetComplaintForm = () => {
    setComplaintTitle('');
    setComplaintDescription('');
    setComplaintType('Plumbing');
    setComplaintUrgency('Medium');
    setComplaintImages([]);
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setComplaintImages([...complaintImages, result.assets[0].uri]);
    }
  };
  
  const removeImage = (index: number) => {
    const updatedImages = [...complaintImages];
    updatedImages.splice(index, 1);
    setComplaintImages(updatedImages);
  };
  
  const getActiveComplaints = () => {
    switch (activeTab) {
      case 0:
        return pendingComplaints;
      case 1:
        return inProgressComplaints;
      case 2:
        return resolvedComplaints;
      default:
        return complaints;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tabs */}
      <SegmentedControl
        options={['Pending', 'In Progress', 'Resolved']}
        selectedIndex={activeTab}
        onChange={handleTabChange}
        style={styles.tabs}
      />
      
      {/* New Complaint Button */}
      {!showNewComplaint && (
        <Button
          title="Raise New Complaint"
          onPress={handleAddComplaint}
          icon={<Plus size={18} color={colors.text.primary} />}
          style={styles.newButton}
        />
      )}
      
      {/* New Complaint Form */}
      {showNewComplaint && (
        <Card style={styles.formCard}>
          <View style={styles.formHeader}>
            <AlertCircle size={20} color={colors.accent.primary} />
            <Text style={styles.formTitle}>New Complaint</Text>
          </View>
          
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={colors.text.muted}
            value={complaintTitle}
            onChangeText={setComplaintTitle}
          />
          
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe your issue..."
            placeholderTextColor={colors.text.muted}
            value={complaintDescription}
            onChangeText={setComplaintDescription}
            multiline
            numberOfLines={4}
          />
          
          <Text style={styles.sectionLabel}>Type</Text>
          <View style={styles.typeOptions}>
            {complaintTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  complaintType === type && styles.selectedTypeOption,
                ]}
                onPress={() => setComplaintType(type)}
              >
                <Text
                  style={[
                    styles.typeText,
                    complaintType === type && styles.selectedTypeText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionLabel}>Urgency</Text>
          <View style={styles.urgencyOptions}>
            {urgencyLevels.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyOption,
                  complaintUrgency === level && styles.selectedUrgencyOption,
                ]}
                onPress={() => setComplaintUrgency(level)}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    complaintUrgency === level && styles.selectedUrgencyText,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionLabel}>Attachments</Text>
          <View style={styles.imagesContainer}>
            {complaintImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            ))}
            
            {complaintImages.length < 3 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Camera size={24} color={colors.text.muted} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.formActions}>
            <Button
              title="Cancel"
              onPress={handleCancelComplaint}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Submit"
              onPress={handleSubmitComplaint}
              disabled={!complaintTitle.trim() || !complaintDescription.trim()}
              style={styles.actionButton}
            />
          </View>
        </Card>
      )}
      
      {/* Complaints List */}
      {!showNewComplaint && getActiveComplaints().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {['pending', 'in progress', 'resolved'][activeTab]} complaints</Text>
        </View>
      ) : (
        getActiveComplaints().map(complaint => (
          <Card key={complaint.id} style={styles.complaintCard}>
            <View style={styles.complaintHeader}>
              <Text style={styles.complaintTitle}>{complaint.title}</Text>
              <StatusBadge status={complaint.status} />
            </View>
            
            <Text style={styles.complaintDescription}>{complaint.description}</Text>
            
            <View style={styles.complaintDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{complaint.type}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Urgency:</Text>
                <StatusBadge status={complaint.urgency} style={styles.urgencyBadge} />
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Reported:</Text>
                <Text style={styles.detailValue}>
                  {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </View>
            
            {complaint.response && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Response:</Text>
                <Text style={styles.responseText}>{complaint.response}</Text>
              </View>
            )}
            
            {complaint.images && complaint.images.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentsLabel}>Attachments:</Text>
                <View style={styles.attachmentImages}>
                  {complaint.images.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.attachmentImage} />
                  ))}
                </View>
              </View>
            )}
          </Card>
        ))
      )}
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
  tabs: {
    marginBottom: 16,
  },
  newButton: {
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: colors.background.card,
    marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginLeft: 8,
  },
  titleInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: 8,
    padding: 12,
    color: colors.text.primary,
    marginBottom: 12,
  },
  descriptionInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: 8,
    padding: 12,
    color: colors.text.primary,
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  typeOption: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeOption: {
    backgroundColor: colors.accent.primary,
  },
  typeText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  selectedTypeText: {
    color: colors.text.primary,
  },
  urgencyOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  urgencyOption: {
    flex: 1,
    backgroundColor: colors.background.elevated,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  selectedUrgencyOption: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  urgencyText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  selectedUrgencyText: {
    color: colors.accent.primary,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.status.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 4,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
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
  complaintCard: {
    backgroundColor: colors.background.card,
    marginBottom: 12,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  complaintDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.text.muted,
    width: 70,
  },
  detailValue: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  urgencyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  responseContainer: {
    backgroundColor: colors.background.elevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  attachmentImages: {
    flexDirection: 'row',
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 8,
  },
});