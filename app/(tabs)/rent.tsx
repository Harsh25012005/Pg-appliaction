import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { IndianRupee, Download, X, CheckCircle, Calendar, Clock, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useRent } from '@/store/rent-store';
import * as WebBrowser from 'expo-web-browser';

export default function RentScreen() {
  const { rentHistory, currentRent, payRent } = useRent();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedUPI, setSelectedUPI] = useState<string | null>(null);
  
  const handlePayNow = () => {
    setPaymentModalVisible(true);
  };
  
  const handleUPISelect = (upi: string) => {
    setSelectedUPI(upi);
  };
  
  const handlePaymentConfirm = async () => {
    if (!currentRent) return;
    
    setPaymentSuccess(true);
    
    setTimeout(() => {
      setPaymentModalVisible(false);
      setPaymentSuccess(false);
      setSelectedUPI(null);
      payRent(currentRent.id);
    }, 2000);
  };
  
  const handleDownloadReceipt = async (receiptUrl: string) => {
    await WebBrowser.openBrowserAsync(receiptUrl);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Current Rent Section */}
      {currentRent && (
        <Card elevated style={styles.currentRentCard}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.1)', 'rgba(245, 158, 11, 0.1)']}
            style={styles.rentGradient}
          >
            <View style={styles.rentHeader}>
              <View style={styles.rentIconContainer}>
                <IndianRupee size={28} color={colors.status.error} />
              </View>
              <View style={styles.rentInfo}>
                <Text style={styles.rentLabel}>Outstanding Rent</Text>
                <Text style={styles.rentAmount}>₹{currentRent.amount.toLocaleString()}</Text>
                <Text style={styles.rentMonth}>{currentRent.month}</Text>
              </View>
              <View style={styles.urgentIndicator}>
                <View style={styles.urgentDot} />
                <Text style={styles.urgentText}>Overdue</Text>
              </View>
            </View>
            
            <View style={styles.rentDetails}>
              <View style={styles.rentDetailRow}>
                <Calendar size={16} color={colors.text.muted} />
                <Text style={styles.rentDetailText}>
                  Due date: {new Date(currentRent.dueDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.rentDetailRow}>
                <Clock size={16} color={colors.text.muted} />
                <Text style={styles.rentDetailText}>
                  {Math.ceil((new Date().getTime() - new Date(currentRent.dueDate).getTime()) / (1000 * 3600 * 24))} days overdue
                </Text>
              </View>
            </View>
            
            <Button 
              title="Pay Now" 
              onPress={handlePayNow} 
              style={styles.payButton}
              size="large"
              fullWidth
            />
          </LinearGradient>
        </Card>
      )}

      {/* Payment History Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        <Text style={styles.sectionSubtitle}>Your rent payment records</Text>
      </View>
      
      <View style={styles.historyContainer}>
        {rentHistory
          .filter(rent => rent.status === 'paid')
          .map(rent => (
            <Card key={rent.id} variant="glass" style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIconContainer}>
                  <CheckCircle size={20} color={colors.status.success} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyMonth}>{rent.month}</Text>
                  <Text style={styles.historyAmount}>₹{rent.amount.toLocaleString()}</Text>
                </View>
                
                {rent.receipt && (
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => handleDownloadReceipt(rent.receipt!)}
                    activeOpacity={0.8}
                  >
                    <Download size={16} color={colors.accent.primary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>
                  Paid on {rent.paidOn ? new Date(rent.paidOn).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                </Text>
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>Paid</Text>
                </View>
              </View>
            </Card>
          ))}
      </View>
      
      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {paymentSuccess ? 'Payment Successful!' : 'Complete Payment'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setPaymentSuccess(false);
                  setSelectedUPI(null);
                }}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {paymentSuccess ? (
              <View style={styles.successContainer}>
                <LinearGradient
                  colors={[colors.status.success + '20', colors.status.success + '10']}
                  style={styles.successIconContainer}
                >
                  <CheckCircle size={64} color={colors.status.success} />
                </LinearGradient>
                <Text style={styles.successTitle}>Payment Completed</Text>
                <Text style={styles.successMessage}>
                  Your rent payment of ₹{currentRent?.amount.toLocaleString()} has been processed successfully.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.paymentHeader}>
                  <CreditCard size={24} color={colors.accent.primary} />
                  <Text style={styles.paymentAmount}>₹{currentRent?.amount.toLocaleString()}</Text>
                </View>
                
                <Text style={styles.paymentDescription}>
                  Choose your preferred payment method
                </Text>
                
                <View style={styles.upiGrid}>
                  {[
                    { id: 'gpay', name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Google_Pay_%28GPay%29_Logo.svg/2560px-Google_Pay_%28GPay%29_Logo.svg.png' },
                    { id: 'phonepe', name: 'PhonePe', logo: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png' },
                    { id: 'paytm', name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png' },
                  ].map((upi) => (
                    <TouchableOpacity 
                      key={upi.id}
                      style={[styles.upiOption, selectedUPI === upi.id && styles.selectedUPI]}
                      onPress={() => handleUPISelect(upi.id)}
                      activeOpacity={0.8}
                    >
                      <Image 
                        source={{ uri: upi.logo }} 
                        style={styles.upiLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.upiName}>{upi.name}</Text>
                      {selectedUPI === upi.id && (
                        <View style={styles.selectedIndicator}>
                          <CheckCircle size={16} color={colors.accent.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Button 
                  title="Proceed to Pay" 
                  onPress={handlePaymentConfirm}
                  disabled={!selectedUPI}
                  style={styles.proceedButton}
                  size="large"
                  fullWidth
                />
                
                <Text style={styles.secureText}>
                  🔒 Your payment is secured with bank-level encryption
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  currentRentCard: {
    marginBottom: 32,
    padding: 0,
  },
  rentGradient: {
    padding: 24,
    borderRadius: 16,
  },
  rentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rentLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 4,
  },
  rentAmount: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.text.primary,
    marginBottom: 2,
  },
  rentMonth: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  urgentIndicator: {
    alignItems: 'center',
  },
  urgentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.status.error,
    marginBottom: 4,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.status.error,
  },
  rentDetails: {
    gap: 8,
    marginBottom: 24,
  },
  rentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rentDetailText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  payButton: {
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
  },
  historyContainer: {
    gap: 12,
  },
  historyCard: {
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 2,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 14,
    color: colors.text.muted,
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.status.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: colors.text.primary,
  },
  paymentDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  upiGrid: {
    gap: 16,
    marginBottom: 32,
  },
  upiOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedUPI: {
    borderColor: colors.accent.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  upiLogo: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  upiName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  proceedButton: {
    marginBottom: 16,
  },
  secureText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});