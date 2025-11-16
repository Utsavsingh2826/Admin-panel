import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface CreateShipmentRequest {
  token: string;
  location: string;
  shipmentType: string;
  serviceType: string;
  pickUpDate?: string;
  pickUpTime?: string;
  fromStoreCode: string;
  toAddress: {
    consignee_name: string;
    address_line1: string;
    address_line2?: string;
    pinCode: string;
    auth_receiver_name: string;
    auth_receiver_phone: string;
  };
  net_weight: string;
  gross_weight?: string;
  net_value: string;
  codValue?: string;
  no_of_packages: string;
  boxes?: Array<{
    box_number: string;
    lock_number?: string;
    length: string;
    breadth: string;
    height: string;
    gross_weight: string;
  }>;
  invoice?: string[];
  remark?: string;
}

interface SequelLogisticsResponse {
  status: string;
  message?: string;
  data?: {
    docketNumber: string;
    brn: string;
    senders_name: string;
    senders_phone?: string;
    geography: string;
    category_type: string;
    product_type: string;
    client_code: string;
    sender_store_code: string;
    receiver_store_code: string;
    actual_value: string;
    no_of_packages: string;
    total_net_weight: string;
    total_gross_weight: string;
    cod: string;
    estimated_delivery?: string;
    special_instructions?: string;
    invoices?: string[];
    box_details?: Array<{
      box_number: string;
      lock_number?: string;
      length: string;
      breadth: string;
      height: string;
      gross_weight: string;
    }>;
    docket_print?: string;
  };
  errorInfo?: any;
  code?: number;
}

class SequelLogisticsService {
  private endpoint: string;
  private token: string;
  private storeCode: string;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    this.endpoint = isProduction
      ? process.env.SEQUEL247_PROD_ENDPOINT || 'https://sequel247.com/'
      : process.env.SEQUEL247_TEST_ENDPOINT || 'https://test.sequel247.com/';
    this.token = isProduction
      ? process.env.SEQUEL247_PROD_TOKEN || ''
      : process.env.SEQUEL247_TEST_TOKEN || '';
    this.storeCode = process.env.SEQUEL247_STORE_CODE || '';

    if (!this.token) {
      throw new Error('Sequel Logistics token is not configured');
    }
    if (!this.storeCode) {
      throw new Error('Sequel Logistics store code is not configured');
    }
  }

  /**
   * Create a shipment in Sequel Logistics
   */
  async createShipment(orderData: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    totalAmount: number;
    items: Array<{
      name: string;
      quantity: number;
      weight?: number;
    }>;
    codValue?: number;
  }): Promise<SequelLogisticsResponse> {
    try {
      // Calculate total weight (estimate 10g per item if not provided)
      const totalNetWeight = orderData.items.reduce((sum, item) => {
        return sum + (item.weight || 10) * item.quantity;
      }, 0);

      // Determine service type based on order value
      // For jewelry, we'll use "valuable" for high-value items
      const serviceType = orderData.totalAmount > 100000 ? 'valuable' : 'valuable';

      // Prepare shipment request
      const shipmentRequest: CreateShipmentRequest = {
        token: this.token,
        location: 'domestic',
        shipmentType: 'D&J', // Diamond & Jewelry
        serviceType: serviceType,
        pickUpDate: 'Tomorrow',
        pickUpTime: '16:00-17:00', // 4 PM
        fromStoreCode: this.storeCode,
        toAddress: {
          consignee_name: orderData.customerName,
          address_line1: orderData.shippingAddress.line1.substring(0, 50), // Max 50 chars
          address_line2: orderData.shippingAddress.line2
            ? orderData.shippingAddress.line2.substring(0, 50)
            : `${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`.substring(0, 50),
          pinCode: orderData.shippingAddress.postalCode,
          auth_receiver_name: orderData.customerName,
          auth_receiver_phone: orderData.customerPhone.replace(/\D/g, '').substring(0, 10), // Only digits, max 10
        },
        net_weight: totalNetWeight.toString(),
        gross_weight: (totalNetWeight + 50).toString(), // Add packaging weight
        net_value: Math.round(orderData.totalAmount).toString(),
        // We don't provide COD, so codValue is not included
        no_of_packages: '1',
        remark: `Order: ${orderData.orderNumber}`,
        invoice: [orderData.orderNumber],
      };

      // Make API call
      const response = await axios.post<SequelLogisticsResponse>(
        `${this.endpoint}api/shipment/create`,
        shipmentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Sequel API returned an error
        return error.response.data;
      }
      // Network or other error
      throw new Error(
        error.message || 'Failed to create shipment with Sequel Logistics'
      );
    }
  }

  /**
   * Check serviceability of a pincode
   */
  async checkServiceability(pinCode: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.endpoint}api/checkServiceability`,
        {
          token: this.token,
          pin_code: pinCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('Failed to check serviceability');
    }
  }

  /**
   * Calculate Estimated Delivery Date
   */
  async calculateEDD(
    originPincode: string,
    destinationPincode: string,
    pickupDate: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.endpoint}api/shipment/calculateEDD`,
        {
          token: this.token,
          origin_pincode: originPincode,
          destination_pincode: destinationPincode,
          pickup_date: pickupDate,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('Failed to calculate EDD');
    }
  }
}

export default SequelLogisticsService;

