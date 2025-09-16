import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';

export interface SupportAgent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  rating: number;
  specialties: string[];
  responseTime?: string;
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
  status: 'connecting' | 'active' | 'ended' | 'queued';
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  priority: number;
  queuePosition?: number;
  estimatedWaitTime?: number;
}

export interface QueueItem {
  id: string;
  userId: string;
  type: 'general' | 'remote-assistance' | 'urgent';
  priority: number;
  timestamp: Date;
  initialMessage?: string;
  estimatedWaitTime: number;
}

export interface SupportStats {
  totalAgents: number;
  onlineAgents: number;
  busyAgents: number;
  queueLength: number;
  averageWaitTime: number;
  averageResponseTime: number;
  resolutionRate: number;
}

export const [SupportProvider, useSupport] = createContextHook(() => {
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
      currentChats: 1,
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
      currentChats: 0,
      maxChats: 4,
      lastActivity: new Date()
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      role: 'Remote Access Specialist',
      status: 'online',
      rating: 4.9,
      specialties: ['TeamViewer', 'Remote Desktop', 'Screen Sharing'],
      responseTime: '< 1 min',
      currentChats: 2,
      maxChats: 2,
      lastActivity: new Date()
    },
    {
      id: '4',
      name: 'Mike Davis',
      role: 'IT Support Technician',
      status: 'busy',
      rating: 4.7,
      specialties: ['Hardware Troubleshooting', 'Software Installation', 'User Support'],
      responseTime: '< 5 min',
      currentChats: 3,
      maxChats: 3,
      lastActivity: new Date()
    },
    {
      id: '5',
      name: 'Alex Chen',
      role: 'Network Administrator',
      status: 'offline',
      rating: 4.6,
      specialties: ['Network Configuration', 'VPN Setup', 'Router Management'],
      responseTime: '< 10 min',
      currentChats: 0,
      maxChats: 2,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ]);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [supportQueue, setSupportQueue] = useState<QueueItem[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  const loadChatHistory = useCallback(async () => {
    try {
      console.log('Loading chat history');
      setChatHistory([]);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  const saveChatHistory = useCallback(async (sessions: ChatSession[]) => {
    if (!sessions || sessions.length === 0) return;
    try {
      console.log('Saving chat history:', sessions.length, 'sessions');
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, []);

  const updateAgentStatuses = useCallback(() => {
    setAgents(prevAgents => 
      prevAgents.map(agent => {
        const timeSinceLastActivity = Date.now() - agent.lastActivity.getTime();
        const isInactive = timeSinceLastActivity > 10 * 60 * 1000;
        
        let newStatus = agent.status;
        if (isInactive && agent.status === 'online') {
          newStatus = 'offline';
        } else if (agent.currentChats >= agent.maxChats && agent.status === 'online') {
          newStatus = 'busy';
        } else if (agent.currentChats < agent.maxChats && agent.status === 'busy') {
          newStatus = 'online';
        }
        
        return {
          ...agent,
          status: newStatus
        };
      })
    );
  }, []);

  const getAvailableAgents = useCallback((type?: 'general' | 'remote-assistance' | 'urgent') => {
    if (type && !['general', 'remote-assistance', 'urgent'].includes(type)) {
      console.warn('Invalid support type:', type);
      return [];
    }

    let availableAgents = agents.filter(agent => 
      agent.status === 'online' && agent.currentChats < agent.maxChats
    );
    
    if (type === 'urgent') {
      availableAgents = availableAgents.filter(agent => agent.isUrgentSpecialist);
    } else if (type === 'remote-assistance') {
      availableAgents = availableAgents.filter(agent => 
        agent.specialties.some(specialty => 
          specialty.toLowerCase().includes('remote') || 
          specialty.toLowerCase().includes('teamviewer')
        )
      );
    }
    
    return availableAgents.sort((a, b) => {
      const availabilityDiff = a.currentChats - b.currentChats;
      if (availabilityDiff !== 0) return availabilityDiff;
      return b.rating - a.rating;
    });
  }, [agents]);

  const findBestAgent = useCallback((type: 'general' | 'remote-assistance' | 'urgent'): SupportAgent | null => {
    if (!type || !['general', 'remote-assistance', 'urgent'].includes(type)) {
      console.warn('Invalid support type:', type);
      return null;
    }
    const availableAgents = getAvailableAgents(type);
    return availableAgents[0] || null;
  }, [getAvailableAgents]);

  const calculateWaitTime = useCallback((type: 'general' | 'remote-assistance' | 'urgent'): number => {
    if (!type || !['general', 'remote-assistance', 'urgent'].includes(type)) {
      console.warn('Invalid support type:', type);
      return 0;
    }
    const queueCount = supportQueue.filter(item => item.type === type).length;
    const availableAgents = getAvailableAgents(type).length;
    
    if (availableAgents > 0) return 0;
    
    const baseWaitTime = type === 'urgent' ? 2 : type === 'remote-assistance' ? 5 : 8;
    return Math.max(baseWaitTime, queueCount * 3);
  }, [supportQueue, getAvailableAgents]);

  const addToQueue = useCallback((type: 'general' | 'remote-assistance' | 'urgent', initialMessage?: string): QueueItem => {
    if (!type || !['general', 'remote-assistance', 'urgent'].includes(type)) {
      throw new Error('Invalid support type');
    }
    if (initialMessage && initialMessage.length > 500) {
      initialMessage = initialMessage.substring(0, 500);
    }

    const priority = type === 'urgent' ? 1 : type === 'remote-assistance' ? 2 : 3;
    const estimatedWaitTime = calculateWaitTime(type);
    
    const queueItem: QueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user',
      type,
      priority,
      timestamp: new Date(),
      initialMessage,
      estimatedWaitTime
    };
    
    setSupportQueue(prev => {
      const newQueue = [...prev, queueItem].sort((a, b) => a.priority - b.priority);
      return newQueue;
    });
    
    return queueItem;
  }, [calculateWaitTime]);

  const removeFromQueue = useCallback((queueItemId: string) => {
    if (!queueItemId || queueItemId.trim().length === 0) {
      console.warn('Invalid queue item ID');
      return;
    }
    setSupportQueue(prev => prev.filter(item => item.id !== queueItemId.trim()));
  }, []);

  const createChatSession = useCallback((
    agent: SupportAgent, 
    type: 'general' | 'remote-assistance' | 'urgent',
    initialMessage?: string
  ): ChatSession => {
    if (!agent || !agent.id || !agent.name) {
      throw new Error('Invalid agent data');
    }
    if (!type || !['general', 'remote-assistance', 'urgent'].includes(type)) {
      throw new Error('Invalid support type');
    }
    if (initialMessage && initialMessage.length > 500) {
      initialMessage = initialMessage.substring(0, 500);
    }

    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const priority = type === 'urgent' ? 1 : type === 'remote-assistance' ? 2 : 3;
    
    const session: ChatSession = {
      id: sessionId,
      agentId: agent.id,
      agentName: agent.name,
      type,
      status: 'connecting',
      messages: initialMessage ? [{
        id: `msg_${Date.now()}`,
        text: initialMessage,
        sender: 'user',
        timestamp: new Date()
      }] : [],
      startTime: new Date(),
      priority
    };
    
    return session;
  }, []);

  const addSystemMessage = useCallback((sessionId: string, text: string) => {
    if (!sessionId || sessionId.trim().length === 0) return;
    if (!text || text.trim().length === 0) return;

    const systemMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text,
      sender: 'agent',
      timestamp: new Date(),
      type: 'system'
    };
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, systemMessage]
      } : null);
    }
    
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: [...session.messages, systemMessage] }
        : session
    ));
  }, [currentSession]);

  const connectToAgent = useCallback(async (session: ChatSession): Promise<boolean> => {
    setIsConnecting(true);
    
    try {
      setAgents(prev => prev.map(agent => 
        agent.id === session.agentId 
          ? { ...agent, currentChats: agent.currentChats + 1, lastActivity: new Date() }
          : agent
      ));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: `Hello! I'm ${session.agentName}, and I'll be assisting you today. How can I help you?`,
        sender: 'agent',
        timestamp: new Date(),
        agentName: session.agentName,
        type: 'system'
      };
      
      const updatedSession: ChatSession = {
        ...session,
        status: 'active',
        messages: [...session.messages, welcomeMessage]
      };
      
      setCurrentSession(updatedSession);
      setChatSessions(prev => [...prev, updatedSession]);
      
      if (session.type === 'remote-assistance') {
        setTimeout(() => {
          addSystemMessage(
            updatedSession.id,
            "I've initiated a TeamViewer session request. You should receive a notification shortly. Please accept it so I can assist you remotely."
          );
        }, 3000);
      }
      
      setIsConnecting(false);
      return true;
    } catch (error) {
      console.error('Failed to connect to agent:', error);
      setIsConnecting(false);
      return false;
    }
  }, [addSystemMessage]);

  const processQueue = useCallback(() => {
    if (supportQueue.length === 0) return;
    
    const availableAgents = getAvailableAgents();
    if (availableAgents.length === 0) return;
    
    const sortedQueue = [...supportQueue].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
    
    for (const queueItem of sortedQueue) {
      const suitableAgent = findBestAgent(queueItem.type);
      if (suitableAgent) {
        const session = createChatSession(suitableAgent, queueItem.type, queueItem.initialMessage);
        connectToAgent(session);
        removeFromQueue(queueItem.id);
        break;
      }
    }
  }, [supportQueue, getAvailableAgents, findBestAgent, createChatSession, connectToAgent, removeFromQueue]);

  const startChat = useCallback(async (
    type: 'general' | 'remote-assistance' | 'urgent',
    initialMessage?: string
  ): Promise<{ success: boolean; session?: ChatSession; queueItem?: QueueItem }> => {
    if (!type || !['general', 'remote-assistance', 'urgent'].includes(type)) {
      throw new Error('Invalid support type');
    }
    if (initialMessage && initialMessage.length > 500) {
      initialMessage = initialMessage.substring(0, 500);
    }

    const agent = findBestAgent(type);
    
    if (!agent) {
      const queueItem = addToQueue(type, initialMessage);
      return { success: false, queueItem };
    }
    
    const session = createChatSession(agent, type, initialMessage);
    const connected = await connectToAgent(session);
    
    if (connected) {
      return { success: true, session };
    } else {
      const queueItem = addToQueue(type, initialMessage);
      return { success: false, queueItem };
    }
  }, [findBestAgent, addToQueue, createChatSession, connectToAgent]);

  const simulateAgentResponse = useCallback((sessionId: string, userMessage: string) => {
    if (!sessionId || sessionId.trim().length === 0) return;
    if (!userMessage || userMessage.trim().length === 0) return;

    const responses = [
      "I understand your concern. Let me help you with that right away.",
      "Thank you for providing that information. I'm looking into this now.",
      "I see the issue. Let me walk you through the solution step by step.",
      "That's a great question. Here's what I recommend...",
      "I've reviewed your request and I have a solution for you.",
      "Let me check our system for the best approach to resolve this."
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    const agentMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      text: response,
      sender: 'agent',
      timestamp: new Date(),
      type: 'text'
    };
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, agentMessage]
      } : null);
    }
    
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: [...session.messages, agentMessage] }
        : session
    ));
  }, [currentSession]);

  const sendMessage = useCallback((sessionId: string, text: string) => {
    if (!sessionId || sessionId.trim().length === 0) {
      console.warn('Invalid session ID');
      return;
    }
    if (!text || text.trim().length === 0) {
      console.warn('Empty message text');
      return;
    }
    if (text.length > 1000) {
      text = text.substring(0, 1000);
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);
    }
    
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: [...session.messages, message] }
        : session
    ));
    
    setTimeout(() => {
      simulateAgentResponse(sessionId, text);
    }, 1000 + Math.random() * 2000);
  }, [currentSession, simulateAgentResponse]);

  const endChat = useCallback((sessionId: string) => {
    if (!sessionId || sessionId.trim().length === 0) {
      console.warn('Invalid session ID');
      return;
    }

    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    setAgents(prev => prev.map(agent => 
      agent.id === session.agentId 
        ? { ...agent, currentChats: Math.max(0, agent.currentChats - 1) }
        : agent
    ));
    
    const endedSession: ChatSession = {
      ...session,
      status: 'ended',
      endTime: new Date()
    };
    
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? endedSession : s
    ));
    
    const updatedHistory = [...chatHistory, endedSession];
    setChatHistory(updatedHistory);
    saveChatHistory(updatedHistory);
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [chatSessions, chatHistory, saveChatHistory, currentSession]);

  const getSupportStats = useCallback((): SupportStats => {
    const totalAgents = agents.length;
    const onlineAgents = agents.filter(a => a.status === 'online').length;
    const busyAgents = agents.filter(a => a.status === 'busy').length;
    const queueLength = supportQueue.length;
    
    return {
      totalAgents,
      onlineAgents,
      busyAgents,
      queueLength,
      averageWaitTime: calculateWaitTime('general'),
      averageResponseTime: 4.2,
      resolutionRate: 98.5
    };
  }, [agents, supportQueue, calculateWaitTime]);

  const getQueuePosition = useCallback((queueItemId: string): number => {
    if (!queueItemId || queueItemId.trim().length === 0) {
      console.warn('Invalid queue item ID');
      return 0;
    }

    const sortedQueue = [...supportQueue].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
    
    return sortedQueue.findIndex(item => item.id === queueItemId.trim()) + 1;
  }, [supportQueue]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateAgentStatuses();
      processQueue();
    }, 30000);

    return () => clearInterval(interval);
  }, [updateAgentStatuses, processQueue]);

  return useMemo(() => ({
    agents,
    chatSessions,
    currentSession,
    supportQueue,
    isConnecting,
    chatHistory,
    startChat,
    sendMessage,
    endChat,
    addToQueue,
    removeFromQueue,
    setCurrentSession,
    findBestAgent,
    getAvailableAgents,
    getSupportStats,
    getQueuePosition,
    calculateWaitTime,
    processQueue
  }), [
    agents,
    chatSessions,
    currentSession,
    supportQueue,
    isConnecting,
    chatHistory,
    startChat,
    sendMessage,
    endChat,
    addToQueue,
    removeFromQueue,
    findBestAgent,
    getAvailableAgents,
    getSupportStats,
    getQueuePosition,
    calculateWaitTime,
    processQueue
  ]);
});