import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

export const RAZORPAY_CLIENT = 'RAZORPAY_CLIENT';

export const RazorpayProvider: Provider = {
  provide: RAZORPAY_CLIENT,
  useFactory: (configService: ConfigService) => {
    const keyId = configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      console.warn(
        'Razorpay credentials not configured. Payment gateway will not work.',
      );
      return null;
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  },
  inject: [ConfigService],
};
