import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITIES_KEY = '@store_activity_logs';

export const getLocalActivities = async () => {
  try {
    const stored = await AsyncStorage.getItem(ACTIVITIES_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to load local activity logs:', e);
  }
  // Default mock seed history matching requested user examples
  return [
    {
      id: 'act_1',
      productName: 'Air Max 2026',
      actionType: 'Price Updated',
      details: 'Price changed ₦8,999 → ₦7,999',
      date: 'Today, 1:20 PM',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'act_2',
      productName: 'Running Shoes',
      actionType: 'Image Updated',
      details: 'Product primary photo updated',
      date: 'Yesterday, 12:45 PM',
      timestamp: Date.now() - 86400000,
    },
    {
      id: 'act_3',
      productName: 'Sports Bag',
      actionType: 'Product Added',
      details: 'New product listing created',
      date: 'Yesterday, 5:30 PM',
      timestamp: Date.now() - 90000000,
    },
    {
      id: 'act_4',
      productName: 'T-Shirt',
      actionType: 'Product Deactivated',
      details: 'Status changed to Inactive',
      date: '24 Aug 2026, 4:10 PM',
      timestamp: Date.now() - 172800000,
    },
  ];
};

export const logLocalActivity = async (productName, actionType, details) => {
  try {
    const logs = await getLocalActivities();
    const newEntry = {
      id: `act_${Date.now()}`,
      productName,
      actionType,
      details,
      date: 'Just Now',
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...logs];
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save activity log:', e);
    return [];
  }
};
