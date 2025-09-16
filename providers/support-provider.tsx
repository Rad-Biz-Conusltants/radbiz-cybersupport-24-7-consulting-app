import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useStorage } from '@/providers/storage-provider';

export interface SupportAgent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  rating: number;
  specialties: string[];
  responseTime: string;
  isUrgentSpecialist?: boolean;
  currentChats: number;
  maxChats: number;
  lastActivity: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
  type?: 'text' | 'system' | 'file';
  metadata?: any;
}

export interface ChatSession {
  id: string;
  agentId: string;
  agentName: string;
  type: 'general' | 'remote-assistance' | 'urgent';
  status: 'queued' | 'connecting' | 'active' | 'ended';
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  priority: number;
  queuePosition?: number;
  estimatedWaitTime?: number;
}

export interface QueueItem {
  id: string;
  sessionId: string;
  type: 'general' | 'remote-assistance' | 'urgent';
  priority: number;
  timestamp: Date;
  initialMessage?: string;
}

interface SupportContextType {
  agents: SupportAgent[];
  activeSessions: ChatSession[];
  queue: QueueItem[];
  currentSession: ChatSession | null;
  isConnecting: boolean;
  
  // Agent functions
  findBestAgent: (type: 'general' | 'remote-assistance' | 'urgent') => SupportAgent | null;
  updateAgentStatus: (agentId: string, status: 'online' | 'busy' | 'offline') => void;
  
  // Chat functions
  createChatSession: (type: 'general' | 'remote-assistance' | 'urgent', initialMessage?: string) => Promise<ChatSession>;
  connectToAgent: (sessionId: string) => Promise<boolean>;
  sendMessage: (sessionId: string, message: string) => Promise<void>;
  endChatSession: (sessionId: string) => Promise<void>;
  
  // Queue functions
  addToQueue: (session: ChatSession) => Promise<void>;
  removeFromQueue: (sessionId: string) => void;
  getQueuePosition: (sessionId: string) => number;
  getEstimatedWaitTime: (sessionId: string) => number;
  
  // Quick actions
  findNextAvailableSupport: () => Promise<ChatSession | null>;
  requestRemoteAssistance: () => Promise<ChatSession | null>;
  urgentConnectionRequest: () => Promise<ChatSession | null>;
  sendQuickMessage: (message: string) => Promise<ChatSession | null>;
}

const STORAGE_KEYS = {
  CHAT_HISTORY: 'support_chat_history',
  AGENT_PREFERENCES: 'support_agent_preferences',
};

export const [SupportProvider, useSupport] = createContextHook<SupportContextType>(() => {
  const storage = useStorage();
  
  const [agents, setAgents] = useState<SupportAgent[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      role: 'Senior IT Specialist',
      status: 'online',
      rating: 4.9,
      specialties: ['Network Security', 'Server Management', 'Email Systems'],
      responseTime: '< 2 min',
      isUrgentSpecialist: true,
      currentChats: 0,
      maxChats: 3,
      lastActivity: new Date()
    },
    {
      id: '2',
      name: 'John Smith',
      role: 'Cybersecurity Expert',
      status: 'online',
      rating: 4.8,
      specialties: ['Threat Analysis', 'Firewall Configuration', 'Security Audits'],
      responseTime: '< 3 min',
      isUrgentSpecialist: true,
      currentChats: 1,
      maxChats: 2,
      lastActivity: new Date()
    },
    {
      id: '3',
      name: 'Mike Davis',
      role: 'IT Support Technician',
      status: 'busy',
      rating: 4.7,
      specialties: ['Hardware Troubleshooting', 'Software Installation', 'User Support'],
      responseTime: '< 5 min',
      currentChats: 2,
      maxChats: 2,
      lastActivity: new Date()
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      role: 'Remote Access Specialist',
      status: 'online',
      rating: 4.9,
      specialties: ['TeamViewer', 'Remote Desktop', 'Screen Sharing'],
      responseTime: '< 1 min',
      currentChats: 0,
      maxChats: 4,
      lastActivity: new Date()
    },
    {
      id: '5',
      name: 'Alex Chen',
      role: 'Technical Support Lead',
      status: 'offline',
      rating: 4.6,
      specialties: ['System Administration', 'Database Management', 'Cloud Services'],
      responseTime: '< 4 min',
      currentChats: 0,
      maxChats: 3,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ]);
  
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Simulate agent status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        // Randomly change agent status occasionally (less frequently)
        if (Math.random() < 0.05) { // Reduced from 0.1 to 0.05
          // Keep most agents online or busy, rarely offline
          const newStatus: 'online' | 'busy' | 'offline' = Math.random() < 0.8 ? 'online' : Math.random() < 0.95 ? 'busy' : 'offline';
          
          console.log(`Agent ${agent.name} status changed to ${newStatus}`);
          
          return {
            ...agent,
            status: newStatus,
            currentChats: newStatus === 'offline' ? 0 : agent.currentChats,
            lastActivity: new Date()
          };
        }
        return agent;
      }));
    }, 45000); // Check every 45 seconds (increased from 30)

    return () => clearInterval(interval);
  }, []);

  const findBestAgent = useCallback((type: 'general' | 'remote-assistance' | 'urgent'): SupportAgent | null => {
    let availableAgents = agents.filter(agent => 
      agent.status === 'online' && agent.currentChats < agent.maxChats
    );
    
    if (type === 'urgent') {
      const urgentAgents = availableAgents.filter(agent => agent.isUrgentSpecialist);
      if (urgentAgents.length > 0) {
        availableAgents = urgentAgents;
      }
    } else if (type === 'remote-assistance') {
      const remoteAgents = availableAgents.filter(agent => 
        agent.specialties.some(specialty => 
          specialty.toLowerCase().includes('remote') || 
          specialty.toLowerCase().includes('teamviewer') ||
          specialty.toLowerCase().includes('screen sharing')
        )
      );
      if (remoteAgents.length > 0) {
        availableAgents = remoteAgents;
      }
    }
    
    if (availableAgents.length === 0) {
      return null;
    }
    
    // Sort by rating and current workload
    return availableAgents.sort((a, b) => {
      const aScore = a.rating - (a.currentChats / a.maxChats);
      const bScore = b.rating - (b.currentChats / b.maxChats);
      return bScore - aScore;
    })[0];
  }, [agents]);

  const updateAgentStatus = useCallback((agentId: string, status: 'online' | 'busy' | 'offline') => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status, lastActivity: new Date() }
        : agent
    ));
  }, []);

  const removeFromQueue = useCallback((sessionId: string) => {
    setQueue(prev => prev.filter(item => item.sessionId !== sessionId));
  }, []);

  const getQueuePosition = useCallback((sessionId: string): number => {
    const sortedQueue = [...queue].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
    
    return sortedQueue.findIndex(item => item.sessionId === sessionId);
  }, [queue]);

  const getEstimatedWaitTime = useCallback((sessionId: string): number => {
    const position = getQueuePosition(sessionId);
    if (position === -1) return 0;
    
    // Estimate 3-5 minutes per person ahead in queue
    const baseWaitTime = 4; // minutes
    return (position + 1) * baseWaitTime;
  }, [getQueuePosition]);

  const addToQueue = useCallback(async (session: ChatSession): Promise<void> => {
    console.log(`Adding session ${session.id} to queue with priority ${session.priority}`);
    
    const queueItem: QueueItem = {
      id: `queue_${Date.now()}`,
      sessionId: session.id,
      type: session.type,
      priority: session.priority,
      timestamp: new Date(),
    };

    setQueue(prev => {
      const newQueue = [...prev, queueItem];
      console.log(`Queue now has ${newQueue.length} items`);
      return newQueue;
    });
    
    // Update session with queue info after a short delay to ensure proper positioning
    setTimeout(() => {
      const position = getQueuePosition(session.id);
      const waitTime = getEstimatedWaitTime(session.id);
      
      console.log(`Session ${session.id} queue position: ${position + 1}, estimated wait: ${waitTime} min`);
      
      setActiveSessions(prev => prev.map(s => 
        s.id === session.id 
          ? { ...s, queuePosition: position + 1, estimatedWaitTime: waitTime }
          : s
      ));
      
      if (currentSession?.id === session.id) {
        setCurrentSession(prev => prev ? {
          ...prev,
          queuePosition: position + 1,
          estimatedWaitTime: waitTime
        } : null);
      }
    }, 500);
  }, [getQueuePosition, getEstimatedWaitTime, currentSession]);

  const connectToAgent = useCallback(async (sessionId: string): Promise<boolean> => {
    console.log(`Attempting to connect session ${sessionId} to agent`);
    setIsConnecting(true);
    
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) {
      console.log(`Session ${sessionId} not found`);
      setIsConnecting(false);
      return false;
    }

    const agent = findBestAgent(session.type);
    if (!agent || agent.currentChats >= agent.maxChats) {
      console.log(`No available agent found for session type: ${session.type}`);
      setIsConnecting(false);
      return false;
    }

    console.log(`Connecting to agent: ${agent.name}`);
    
    // Update session to connecting status first
    setActiveSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'connecting' as const } : s
    ));
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, status: 'connecting' as const } : null);
    }

    // Simulate connection delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

    // Update agent workload
    setAgents(prev => prev.map(a => 
      a.id === agent.id 
        ? { ...a, currentChats: a.currentChats + 1, status: a.currentChats + 1 >= a.maxChats ? 'busy' : 'online' }
        : a
    ));

    // Update session to active with agent welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: `Hello! I'm ${agent.name}, your assigned tech support specialist. I'm here to help you with any technical issues you may have. How can I assist you today?`,
      sender: 'agent',
      timestamp: new Date(),
      agentName: agent.name,
      type: 'system'
    };

    const updatedSession: ChatSession = {
      ...session,
      agentId: agent.id,
      agentName: agent.name,
      status: 'active',
      messages: [...session.messages, welcomeMessage]
    };

    setActiveSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
    setCurrentSession(updatedSession);
    
    // Remove from queue if it was queued
    removeFromQueue(sessionId);
    
    console.log(`Successfully connected session ${sessionId} to agent ${agent.name}`);
    
    // Handle special session types
    if (session.type === 'remote-assistance') {
      setTimeout(() => {
        const remoteMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          text: "I've initiated a TeamViewer session request. You should receive a notification shortly. Please accept it so I can assist you remotely.",
          sender: 'agent',
          timestamp: new Date(),
          agentName: agent.name,
          type: 'system'
        };
        
        setActiveSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { ...s, messages: [...s.messages, remoteMessage] }
            : s
        ));
        
        if (currentSession?.id === sessionId) {
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, remoteMessage]
          } : null);
        }
      }, 3000);
    }
    
    setIsConnecting(false);
    return true;
  }, [activeSessions, findBestAgent, currentSession, removeFromQueue]);

  const createChatSession = useCallback(async (type: 'general' | 'remote-assistance' | 'urgent', initialMessage?: string): Promise<ChatSession> => {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const priority = type === 'urgent' ? 3 : type === 'remote-assistance' ? 2 : 1;
    
    console.log(`Creating new chat session: ${sessionId}, type: ${type}, priority: ${priority}`);
    
    // Create initial greeting message
    const greetingMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: "Hello! Welcome to our support chat. We're finding the next available tech support agent for you. Please wait a moment...",
      sender: 'agent',
      timestamp: new Date(),
      agentName: 'Support System',
      type: 'system'
    };
    
    const messages: ChatMessage[] = [greetingMessage];
    
    // Add initial user message if provided
    if (initialMessage) {
      messages.push({
        id: `msg_${Date.now() + 1}`,
        text: initialMessage,
        sender: 'user',
        timestamp: new Date()
      });
    }
    
    const session: ChatSession = {
      id: sessionId,
      agentId: '',
      agentName: '',
      type,
      status: 'queued',
      messages,
      startTime: new Date(),
      priority
    };

    setActiveSessions(prev => [...prev, session]);
    setCurrentSession(session);
    
    // Try to find an available agent immediately
    const agent = findBestAgent(type);
    if (agent && agent.currentChats < agent.maxChats) {
      console.log(`Found available agent immediately: ${agent.name}`);
      // Connect immediately
      setTimeout(() => connectToAgent(sessionId), 1000);
    } else {
      console.log(`No available agents - adding to queue`);
      // Add to queue and update session status
      session.status = 'queued';
      await addToQueue(session);
    }
    
    return session;
  }, [findBestAgent, addToQueue, connectToAgent]);

  // Process queue
  useEffect(() => {
    const processQueue = () => {
      if (queue.length === 0) return;

      console.log(`Processing queue with ${queue.length} items`);

      const sortedQueue = [...queue].sort((a, b) => {
        // Sort by priority first, then by timestamp
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return a.timestamp.getTime() - b.timestamp.getTime(); // Earlier timestamp first
      });

      for (const queueItem of sortedQueue) {
        const session = activeSessions.find(s => s.id === queueItem.sessionId);
        if (!session || session.status !== 'queued') {
          console.log(`Skipping queue item - session not found or not queued: ${queueItem.sessionId}`);
          continue;
        }

        const agent = findBestAgent(queueItem.type);
        if (agent && agent.currentChats < agent.maxChats) {
          console.log(`Found available agent ${agent.name} for queued session ${session.id}`);
          // Assign agent to session
          connectToAgent(session.id);
          break; // Process one at a time
        } else {
          console.log(`No available agent for session type: ${queueItem.type}`);
        }
      }
    };

    const interval = setInterval(processQueue, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [queue, activeSessions, findBestAgent, connectToAgent]);

  const sendMessage = useCallback(async (sessionId: string, message: string): Promise<void> => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) {
      console.log(`Session ${sessionId} not found for message sending`);
      return;
    }

    console.log(`Sending message in session ${sessionId}: ${message.substring(0, 50)}...`);

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setActiveSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, messages: [...s.messages, newMessage] }
        : s
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null);
    }

    // Only simulate agent response if session is active
    if (session.status === 'active') {
      setTimeout(() => {
        const responses = [
          "I understand your concern. Let me help you with that right away.",
          "Thank you for providing that information. I'm looking into this now.",
          "I see what you mean. Let me check our system for the best solution.",
          "That's a great question. I'll walk you through the solution step by step.",
          "I've reviewed your request and I have a solution for you.",
          "Let me investigate this issue further and get back to you with a solution.",
          "I can definitely help you with that. Let me walk you through the process.",
          "Thanks for the details. I'm working on resolving this for you now."
        ];
        
        const agentResponse: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'agent',
          timestamp: new Date(),
          agentName: session.agentName
        };
        
        setActiveSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { ...s, messages: [...s.messages, agentResponse] }
            : s
        ));
        
        if (currentSession?.id === sessionId) {
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, agentResponse]
          } : null);
        }
      }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
    }
  }, [activeSessions, currentSession]);

  const endChatSession = useCallback(async (sessionId: string): Promise<void> => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    // Update agent workload
    if (session.agentId) {
      setAgents(prev => prev.map(agent => 
        agent.id === session.agentId 
          ? { 
              ...agent, 
              currentChats: Math.max(0, agent.currentChats - 1),
              status: agent.currentChats - 1 < agent.maxChats ? 'online' : agent.status
            }
          : agent
      ));
    }

    // Update session
    const endedSession = {
      ...session,
      status: 'ended' as const,
      endTime: new Date()
    };

    setActiveSessions(prev => prev.map(s => s.id === sessionId ? endedSession : s));
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }

    // Save to history
    try {
      const history = await storage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      const chatHistory = history ? JSON.parse(history) : [];
      chatHistory.push(endedSession);
      await storage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }

    // Remove from active sessions after a delay
    setTimeout(() => {
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    }, 5000);
  }, [activeSessions, currentSession, storage]);

  // Quick action functions
  const findNextAvailableSupport = useCallback(async (): Promise<ChatSession | null> => {
    console.log('Finding next available support agent...');
    const session = await createChatSession('general');
    
    // Add a status update message after the initial greeting
    setTimeout(() => {
      const statusMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: "Searching for the next available tech support agent...",
        sender: 'agent',
        timestamp: new Date(),
        agentName: 'Support System',
        type: 'system'
      };
      
      setActiveSessions(prev => prev.map(s => 
        s.id === session.id 
          ? { ...s, messages: [...s.messages, statusMessage] }
          : s
      ));
      
      if (currentSession?.id === session.id) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, statusMessage]
        } : null);
      }
    }, 1500);
    
    return session;
  }, [createChatSession, currentSession]);

  const requestRemoteAssistance = useCallback(async (): Promise<ChatSession | null> => {
    const agent = findBestAgent('remote-assistance');
    
    if (!agent) {
      console.log('No remote specialists available - adding to priority queue');
      const session = await createChatSession('remote-assistance', 'Requesting remote assistance support...');
      
      // Add queue acknowledgment message
      const queueMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: "All our remote assistance specialists are currently busy. You've been added to our priority queue for remote support. A specialist will connect with you shortly and initiate TeamViewer access for remote assistance.",
        sender: 'agent',
        timestamp: new Date(),
        agentName: 'Remote Support System',
        type: 'system'
      };
      
      setTimeout(() => {
        setActiveSessions(prev => prev.map(s => 
          s.id === session.id 
            ? { ...s, messages: [...s.messages, queueMessage] }
            : s
        ));
        
        if (currentSession?.id === session.id) {
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, queueMessage]
          } : null);
        }
      }, 1000);
      
      return session;
    }
    
    return await createChatSession('remote-assistance');
  }, [findBestAgent, createChatSession, currentSession]);

  const urgentConnectionRequest = useCallback(async (): Promise<ChatSession | null> => {
    const agent = findBestAgent('urgent');
    
    if (!agent) {
      console.log('No urgent specialists available - adding to high-priority queue');
      const session = await createChatSession('urgent', 'URGENT: Requesting immediate connection to best support agent...');
      
      // Add urgent queue acknowledgment message
      const queueMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: "🚨 URGENT REQUEST RECEIVED: All our senior specialists are currently handling critical issues. You've been placed at the front of our priority queue. Our best available agent will connect with you as soon as possible.",
        sender: 'agent',
        timestamp: new Date(),
        agentName: 'Priority Support System',
        type: 'system'
      };
      
      setTimeout(() => {
        setActiveSessions(prev => prev.map(s => 
          s.id === session.id 
            ? { ...s, messages: [...s.messages, queueMessage] }
            : s
        ));
        
        if (currentSession?.id === session.id) {
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, queueMessage]
          } : null);
        }
      }, 1000);
      
      return session;
    }
    
    return await createChatSession('urgent');
  }, [findBestAgent, createChatSession, currentSession]);

  const sendQuickMessage = useCallback(async (message: string): Promise<ChatSession | null> => {
    if (!message?.trim() || message.length > 1000) {
      console.error('Invalid message');
      return null;
    }
    
    const sanitizedMessage = message.trim();
    const agent = findBestAgent('general');
    
    const session = await createChatSession('general', sanitizedMessage);
    
    if (!agent) {
      console.log('All agents busy - message will be sent when available');
      
      // Add queue acknowledgment message for quick messages
      const queueMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: "Thank you for your message! All our support agents are currently assisting other customers. Your message has been received and you've been added to the queue. An agent will respond to your message as soon as possible.",
        sender: 'agent',
        timestamp: new Date(),
        agentName: 'Support System',
        type: 'system'
      };
      
      setTimeout(() => {
        setActiveSessions(prev => prev.map(s => 
          s.id === session.id 
            ? { ...s, messages: [...s.messages, queueMessage] }
            : s
        ));
        
        if (currentSession?.id === session.id) {
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, queueMessage]
          } : null);
        }
      }, 1500);
    }
    
    return session;
  }, [findBestAgent, createChatSession, currentSession]);

  return useMemo(() => ({
    agents,
    activeSessions,
    queue,
    currentSession,
    isConnecting,
    
    findBestAgent,
    updateAgentStatus,
    
    createChatSession,
    connectToAgent,
    sendMessage,
    endChatSession,
    
    addToQueue,
    removeFromQueue,
    getQueuePosition,
    getEstimatedWaitTime,
    
    findNextAvailableSupport,
    requestRemoteAssistance,
    urgentConnectionRequest,
    sendQuickMessage,
  }), [
    agents,
    activeSessions,
    queue,
    currentSession,
    isConnecting,
    findBestAgent,
    updateAgentStatus,
    createChatSession,
    connectToAgent,
    sendMessage,
    endChatSession,
    addToQueue,
    removeFromQueue,
    getQueuePosition,
    getEstimatedWaitTime,
    findNextAvailableSupport,
    requestRemoteAssistance,
    urgentConnectionRequest,
    sendQuickMessage,
  ]);
});