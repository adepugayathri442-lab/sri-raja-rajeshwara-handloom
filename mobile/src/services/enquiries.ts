import { supabase } from './supabase';

export interface WholesaleEnquiryInput {
  name: string;
  businessName: string;
  phone: string;
  email?: string;
  city: string;
  state: string;
  productsInterested: string;
  approximateQuantity?: string;
  message: string;
}

/**
 * Submit Wholesale Enquiry into Supabase
 */
export async function submitWholesaleEnquiry(
  input: WholesaleEnquiryInput
): Promise<{ success: boolean; enquiryId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('wholesale_enquiries')
      .insert({
        name: input.name.trim(),
        business_name: input.businessName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        city: input.city.trim(),
        state: input.state.trim(),
        products_interested: input.productsInterested.trim(),
        approximate_quantity: input.approximateQuantity?.trim() || null,
        message: input.message.trim(),
        status: 'New',
      })
      .select('id')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to submit enquiry' };
    }

    return { success: true, enquiryId: data.id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to submit wholesale enquiry',
    };
  }
}
