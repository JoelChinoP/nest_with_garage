import { SetMetadata } from '@nestjs/common';

export const RAW_RESPONSE = 'RAW_RESPONSE';
export const RawResponse = () => SetMetadata(RAW_RESPONSE, true);
