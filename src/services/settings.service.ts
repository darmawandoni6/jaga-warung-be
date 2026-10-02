import prisma from '@/config/prisma';
import { UpdateStoreProfileInput } from '@/schemas/settings.schema';

export interface StoreProfileResponse {
  name: string;
  phone: string;
  address: string;
  receiptFooter: string;
}

const DEFAULT_PROFILE: StoreProfileResponse = {
  name: 'Jaga Warung',
  phone: '',
  address: '',
  receiptFooter: 'Terima kasih atas kunjungan Anda!',
};

export const getStoreProfile = async (userId: string): Promise<StoreProfileResponse> => {
  const settings = await prisma.setting.findMany({
    where: {
      userId,
      key: { in: ['name', 'phone', 'address', 'receiptFooter'] },
    },
  });

  const profileMap = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return {
    name: profileMap.name ?? DEFAULT_PROFILE.name,
    phone: profileMap.phone ?? DEFAULT_PROFILE.phone,
    address: profileMap.address ?? DEFAULT_PROFILE.address,
    receiptFooter: profileMap.receiptFooter ?? DEFAULT_PROFILE.receiptFooter,
  };
};

export const updateStoreProfile = async (
  userId: string,
  input: UpdateStoreProfileInput
): Promise<StoreProfileResponse> => {
  const entries = Object.entries(input).filter(([_, value]) => value !== undefined);

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: { value: value as string },
        create: {
          userId,
          key,
          value: value as string,
        },
      })
    )
  );

  return getStoreProfile(userId);
};
