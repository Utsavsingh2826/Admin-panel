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
    docket_number?: string; // Sequel API returns snake_case
    docketNumber?: string; // Some responses might use camelCase
    brn: string;
    senders_name?: string;
    senders_phone?: string;
    geography: string;
    category_type: string;
    product_type: string;
    client_code: string;
    sender_store_code: string;
    receiver_store_code: string;
    actual_value: string;
    no_of_packages: number | string;
    total_net_weight: string;
    total_gross_weight: number | string;
    cod: number | string;
    estimated_delivery?: string;
    estiimated_delivery?: string; // Typo in Sequel API response
    special_instructions?: string;
    insurance?: string;
    movement_type?: string;
    invoices?: string[] | Array<{
      invoiceNumber?: string;
      invoiceDate?: string;
      invoiceFile?: string;
    }>;
    box_details?: Array<{
      box_number: string;
      lock_number?: string;
      length: string;
      breadth: string;
      height: string;
      gross_weight: string;
    }>;
    docket_print?: string;
    orderNumber?: string | null;
    preBooking?: string;
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

    // Log which environment is being used
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 SEQUEL LOGISTICS CONFIGURATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('Environment:', isProduction ? 'PRODUCTION' : 'TEST/DEVELOPMENT');
    console.log('Endpoint:', this.endpoint);
    console.log('Token:', this.token ? `${this.token.substring(0, 8)}...${this.token.substring(this.token.length - 4)}` : 'NOT SET');
    console.log('Store Code:', this.storeCode || 'NOT SET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

      // Log the request being sent (mask token for security)
      const requestForLogging = { ...shipmentRequest };
      if (requestForLogging.token) {
        requestForLogging.token = `${requestForLogging.token.substring(0, 8)}...${requestForLogging.token.substring(requestForLogging.token.length - 4)}`;
      }
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 SEQUEL LOGISTICS API REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Endpoint:', `${this.endpoint}api/shipment/create`);
      console.log('Method: POST');
      console.log('Request Body:', JSON.stringify(requestForLogging, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

      // Log the response received
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 SEQUEL LOGISTICS API RESPONSE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Status:', response.status, response.statusText);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      // Log error response
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ SEQUEL LOGISTICS API ERROR');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (error.response) {
        // Sequel API returned an error
        console.log('Status:', error.response.status, error.response.statusText);
        console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
        console.log('Error Headers:', JSON.stringify(error.response.headers, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return error.response.data;
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received from Sequel Logistics API');
        console.log('Request:', JSON.stringify(error.request, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        // Error setting up the request
        console.log('Error Message:', error.message);
        console.log('Error Stack:', error.stack);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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

  /**
   * Track a single docket in Sequel Logistics
   */
  async trackDocket(docketNumber: string): Promise<any> {
    try {
      const trackRequest = {
        token: this.token,
        docket: docketNumber,
      };

      // Log the request being sent (mask token for security)
      const requestForLogging = { ...trackRequest };
      if (requestForLogging.token) {
        requestForLogging.token = `${requestForLogging.token.substring(0, 8)}...${requestForLogging.token.substring(requestForLogging.token.length - 4)}`;
      }
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 SEQUEL LOGISTICS TRACKING REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Endpoint:', `${this.endpoint}api/track`);
      console.log('Method: POST');
      console.log('Request Body:', JSON.stringify(requestForLogging, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Make API call
      const response = await axios.post(
        `${this.endpoint}api/track`,
        trackRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      // Log the response received
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 SEQUEL LOGISTICS TRACKING RESPONSE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Status:', response.status, response.statusText);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      // Log error response
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ SEQUEL LOGISTICS TRACKING ERROR');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (error.response) {
        // Sequel API returned an error
        console.log('Status:', error.response.status, error.response.statusText);
        console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return error.response.data;
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received from Sequel Logistics API');
        console.log('Request:', JSON.stringify(error.request, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        // Error setting up the request
        console.log('Error Message:', error.message);
        console.log('Error Stack:', error.stack);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
      
      // Network or other error
      throw new Error(
        error.message || 'Failed to track docket with Sequel Logistics'
      );
    }
  }

  /**
   * Track multiple dockets in Sequel Logistics
   */
  async trackMultipleDockets(docketNumbers: string[]): Promise<any> {
    try {
      // Validate docket numbers (must be 10 digits each)
      const invalidDockets = docketNumbers.filter(docket => docket.length !== 10);
      if (invalidDockets.length > 0) {
        throw new Error(`Invalid docket numbers (must be 10 digits): ${invalidDockets.join(', ')}`);
      }

      const trackRequest = {
        token: this.token,
        dockets: docketNumbers,
      };

      // Log the request being sent (mask token for security)
      const requestForLogging = { ...trackRequest };
      if (requestForLogging.token) {
        requestForLogging.token = `${requestForLogging.token.substring(0, 8)}...${requestForLogging.token.substring(requestForLogging.token.length - 4)}`;
      }
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 SEQUEL LOGISTICS MULTIPLE TRACKING REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Endpoint:', `${this.endpoint}api/trackMultiple`);
      console.log('Method: POST');
      console.log('Request Body:', JSON.stringify(requestForLogging, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Make API call
      const response = await axios.post(
        `${this.endpoint}api/trackMultiple`,
        trackRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      // Log the response received
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 SEQUEL LOGISTICS MULTIPLE TRACKING RESPONSE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Status:', response.status, response.statusText);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      // Log error response
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ SEQUEL LOGISTICS MULTIPLE TRACKING ERROR');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (error.response) {
        // Sequel API returned an error
        console.log('Status:', error.response.status, error.response.statusText);
        console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return error.response.data;
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received from Sequel Logistics API');
        console.log('Request:', JSON.stringify(error.request, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        // Error setting up the request
        console.log('Error Message:', error.message);
        console.log('Error Stack:', error.stack);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
      
      // Network or other error
      throw new Error(
        error.message || 'Failed to track dockets with Sequel Logistics'
      );
    }
  }
}

export default SequelLogisticsService;

