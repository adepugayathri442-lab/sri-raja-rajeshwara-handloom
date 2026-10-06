import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../config/colors';
import { businessConfig } from '../config/business';
import { submitWholesaleEnquiry } from '../services/enquiries';
import { useAuth } from '../context/AuthContext';

const QUICK_PRODUCTS = [
  'Towels & Bath Linens',
  'Richcott Bath Towels',
  'Turkey Bath Towels',
  'Check Lungies',
  'Richcott Lungies',
  'Maharashtra Dastie',
  'Condva',
  'Khadhi Long Cloth',
  'Deeksha Cloth',
  'Panchagajam Dhoties',
  'Pooja Dhoties',
  'Sanmaan Shawls',
];

export function WholesaleEnquiryScreen() {
  const { profile } = useAuth();

  const [name, setName] = useState(profile?.fullName || '');
  const [businessName, setBusinessName] = useState(profile?.businessName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['Towels & Bath Linens']);
  const [approxQuantity, setApproxQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleProduct = (prod: string) => {
    setSelectedProducts((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your shop or business name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Required', 'Please enter your city/town.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitWholesaleEnquiry({
        name,
        businessName,
        phone,
        email: email || undefined,
        city,
        state,
        productsInterested: selectedProducts.join(', '),
        approximateQuantity: approxQuantity || undefined,
        message: message.trim() || 'Wholesale piece rate trade enquiry submitted via mobile app.',
      });

      if (!res.success) {
        Alert.alert('Enquiry Failed', res.error || 'Failed to submit enquiry.');
        return;
      }

      Alert.alert(
        'Wholesale Enquiry Submitted!',
        'Our Nizamabad godown merchant will connect with you with wholesale catalog rates.',
        [
          { text: 'OK' },
          {
            text: 'Open WhatsApp',
            onPress: () => {
              const text = encodeURIComponent(
                `*SRI RAJA RAJESHWARA HANDLOOM — Wholesale Bulk Enquiry*\n\n` +
                `Name: ${name}\n` +
                `Shop / Business: ${businessName}\n` +
                `City / State: ${city}, ${state}\n` +
                `Products: ${selectedProducts.join(', ')}\n` +
                `Quantity: ${approxQuantity || 'Any Quantity'}\n` +
                `Requirement: ${message || 'Please send wholesale catalog rates.'}`
              );
              Linking.openURL(`https://wa.me/919440472939?text=${text}`).catch(console.warn);
            },
          },
        ]
      );

      // Reset form fields
      setMessage('');
      setApproxQuantity('');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDirectWhatsApp = () => {
    Linking.openURL(businessConfig.contact.whatsappLink).catch(console.warn);
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <Text style={styles.subTitle}>DIRECT MERCHANT COMMUNICATION</Text>
          <Text style={styles.title}>Wholesale Bulk Enquiry</Text>
          <Text style={styles.desc}>
            Tell us your shop, retail store, or institutional textile requirements for immediate piece rates and bale dispatch quotes.
          </Text>

          <TouchableOpacity style={styles.whatsappBanner} onPress={openDirectWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.whatsappBannerText}>
              Fastest: WhatsApp Us Directly (+91 94404 72939)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>1. Business & Contact Information</Text>

          <Input
            label="Contact Person Name"
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChangeText={setName}
            required
          />

          <Input
            label="Shop / Business Name"
            placeholder="e.g. Sri Balaji Cloth Store"
            value={businessName}
            onChangeText={setBusinessName}
            required
          />

          <Input
            label="WhatsApp / Mobile Number"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            required
          />

          <Input
            label="Email Address (Optional)"
            placeholder="e.g. contact@clothstore.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="City / Town"
                placeholder="e.g. Hyderabad"
                value={city}
                onChangeText={setCity}
                required
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="State"
                placeholder="e.g. Telangana"
                value={state}
                onChangeText={setState}
                required
              />
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>2. Textile Requirements</Text>

          <Text style={styles.chipHeader}>Products Interested In:</Text>
          <View style={styles.chipContainer}>
            {QUICK_PRODUCTS.map((p) => {
              const isSelected = selectedProducts.includes(p);
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleProduct(p)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Approximate Quantity Required"
            placeholder="e.g. 500 pieces, 2 bales, or open volume"
            value={approxQuantity}
            onChangeText={setApproxQuantity}
          />

          <Input
            label="Message / Specific Requirements"
            placeholder="Specify counts, colors, GSM preferences, or destination transport..."
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <Button
            title={isSubmitting ? 'Submitting Enquiry...' : 'Submit Wholesale Enquiry'}
            icon="paper-plane-outline"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            onPress={handleSubmit}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentHover,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  whatsappBanner: {
    backgroundColor: colors.whatsapp,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whatsappBannerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  chipHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: colors.charcoal,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
});
