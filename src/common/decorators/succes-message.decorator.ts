import { SetMetadata } from '@nestjs/common';

export const SUCCESS_MESSAGE_KEY = 'response_message';
export const SuccesMessage = (message: string) => SetMetadata(SUCCESS_MESSAGE_KEY, message);
