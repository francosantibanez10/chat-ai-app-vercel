export interface AnonymousLimits {
  messagesSent: number;
  conversationsCreated: number;
  lastActivity: Date;
  trialStarted: Date;
  isExpired: boolean;
}

const ANONYMOUS_LIMITS_KEY = 'rubi_anonymous_limits';
const MAX_MESSAGES = 10;
const MAX_CONVERSATIONS = 3;
const TRIAL_DURATION_HOURS = 24;

export const getAnonymousLimits = (): AnonymousLimits => {
  if (typeof window === 'undefined') {
    return createDefaultLimits();
  }

  const stored = localStorage.getItem(ANONYMOUS_LIMITS_KEY);
  if (!stored) {
    const defaultLimits = createDefaultLimits();
    setAnonymousLimits(defaultLimits);
    return defaultLimits;
  }

  try {
    const limits = JSON.parse(stored);
    const trialStarted = new Date(limits.trialStarted);
    const now = new Date();
    const hoursElapsed = (now.getTime() - trialStarted.getTime()) / (1000 * 60 * 60);
    
    return {
      ...limits,
      trialStarted: trialStarted,
      lastActivity: new Date(limits.lastActivity),
      isExpired: hoursElapsed >= TRIAL_DURATION_HOURS
    };
  } catch (error) {
    console.error('Error parsing anonymous limits:', error);
    const defaultLimits = createDefaultLimits();
    setAnonymousLimits(defaultLimits);
    return defaultLimits;
  }
};

export const setAnonymousLimits = (limits: AnonymousLimits): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ANONYMOUS_LIMITS_KEY, JSON.stringify({
    ...limits,
    trialStarted: limits.trialStarted.toISOString(),
    lastActivity: limits.lastActivity.toISOString()
  }));
};

export const incrementMessageCount = (): boolean => {
  const limits = getAnonymousLimits();
  
  if (limits.isExpired) {
    return false;
  }
  
  if (limits.messagesSent >= MAX_MESSAGES) {
    return false;
  }
  
  const newLimits = {
    ...limits,
    messagesSent: limits.messagesSent + 1,
    lastActivity: new Date()
  };
  
  setAnonymousLimits(newLimits);
  return true;
};

export const incrementConversationCount = (): boolean => {
  const limits = getAnonymousLimits();
  
  if (limits.isExpired) {
    return false;
  }
  
  if (limits.conversationsCreated >= MAX_CONVERSATIONS) {
    return false;
  }
  
  const newLimits = {
    ...limits,
    conversationsCreated: limits.conversationsCreated + 1,
    lastActivity: new Date()
  };
  
  setAnonymousLimits(newLimits);
  return true;
};

export const canSendMessage = (): boolean => {
  const limits = getAnonymousLimits();
  return !limits.isExpired && limits.messagesSent < MAX_MESSAGES;
};

export const canCreateConversation = (): boolean => {
  const limits = getAnonymousLimits();
  return !limits.isExpired && limits.conversationsCreated < MAX_CONVERSATIONS;
};

export const getRemainingMessages = (): number => {
  const limits = getAnonymousLimits();
  return Math.max(0, MAX_MESSAGES - limits.messagesSent);
};

export const getRemainingConversations = (): number => {
  const limits = getAnonymousLimits();
  return Math.max(0, MAX_CONVERSATIONS - limits.conversationsCreated);
};

export const getTrialTimeRemaining = (): { hours: number; minutes: number } => {
  const limits = getAnonymousLimits();
  const now = new Date();
  const trialEnd = new Date(limits.trialStarted.getTime() + (TRIAL_DURATION_HOURS * 60 * 60 * 1000));
  const timeRemaining = trialEnd.getTime() - now.getTime();
  
  if (timeRemaining <= 0) {
    return { hours: 0, minutes: 0 };
  }
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes };
};

export const resetAnonymousLimits = (): void => {
  const defaultLimits = createDefaultLimits();
  setAnonymousLimits(defaultLimits);
};

const createDefaultLimits = (): AnonymousLimits => {
  const now = new Date();
  return {
    messagesSent: 0,
    conversationsCreated: 0,
    lastActivity: now,
    trialStarted: now,
    isExpired: false
  };
};

export const ANONYMOUS_LIMITS = {
  MAX_MESSAGES,
  MAX_CONVERSATIONS,
  TRIAL_DURATION_HOURS
}; 