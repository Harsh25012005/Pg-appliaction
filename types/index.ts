export interface Rent {
    id: string;
    month: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending';
    paidOn?: string;
    receipt?: string;
  }
  
  export interface Meal {
    id: string;
    date: string;
    breakfast: {
      menu: string;
      opted: boolean;
    };
    lunch: {
      menu: string;
      opted: boolean;
    };
    dinner: {
      menu: string;
      opted: boolean;
    };
  }
  
  export interface MealFeedback {
    mealId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    rating: number;
    comment: string;
  }
  
  export type ComplaintType = 'Plumbing' | 'Electrical' | 'Furniture' | 'Cleanliness' | 'WiFi' | 'Other';
  export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';
  export type ComplaintUrgency = 'Low' | 'Medium' | 'High';
  
  export interface Complaint {
    id: string;
    title: string;
    description: string;
    type: ComplaintType;
    urgency: ComplaintUrgency;
    status: ComplaintStatus;
    createdAt: string;
    updatedAt: string;
    images?: string[];
    response?: string;
  }
  
  export type AnnouncementType = 'Rent' | 'Meals' | 'Maintenance' | 'Emergency' | 'General';
  
  export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    isEmergency: boolean;
    createdAt: string;
    readBy: string[];
  }
  
  export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }
  
  export interface QuickReply {
    id: string;
    text: string;
    action: string;
  }