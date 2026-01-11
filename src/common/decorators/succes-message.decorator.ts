import { SetMetadata } from '@nestjs/common';

export const SUCCES_MESSAGE_KEY = 'response_message';
export const SuccesMessage = (message: string) => SetMetadata(SUCCES_MESSAGE_KEY, message);