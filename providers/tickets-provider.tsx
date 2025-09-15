import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export type TicketStatus = 'pending' | 'open' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type SupportType = 'it' | 'cybersecurity';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  supportType: SupportType;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  attachments?: Array<{
    uri: string;
    name: string;
    size: number;
    mimeType: string;
  }>;
}

export interface TicketStats {
  open: number;
  closed: number;
  pending: number;
  total: number;
  monthlyTotal: number;
}

export interface AccountBalance {
  balance: number;
  usedTickets: number;
  totalTickets: number;
}

interface TicketsContextType {
  tickets: Ticket[];
  ticketStats: TicketStats;
  accountBalance: AccountBalance;
  isLoading: boolean;
  createTicket: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Ticket>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  addCredits: (amount: number) => Promise<void>;
  refreshStats: () => void;
}

const STORAGE_KEYS = {
  TICKETS: 'tickets',
  ACCOUNT_BALANCE: 'account_balance',
  LAST_RESET_MONTH: 'last_reset_month'
};

const DEFAULT_BALANCE: AccountBalance = {
  balance: 850,
  usedTickets: 0,
  totalTickets: 100
};

export const [TicketsProvider, useTickets] = createContextHook<TicketsContextType>(() => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [accountBalance, setAccountBalance] = useState<AccountBalance>(DEFAULT_BALANCE);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load tickets
      const ticketsData = await AsyncStorage.getItem(STORAGE_KEYS.TICKETS);
      if (ticketsData) {
        setTickets(JSON.parse(ticketsData));
      }
      
      // Load account balance
      const balanceData = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_BALANCE);
      if (balanceData) {
        setAccountBalance(JSON.parse(balanceData));
      }
      
      // Check if we need to reset monthly totals
      await checkMonthlyReset();
      
    } catch (error) {
      console.error('Failed to load tickets data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkMonthlyReset = useCallback(async () => {
    try {
      const currentMonth = new Date().getMonth();
      const lastResetMonth = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_MONTH);
      
      if (!lastResetMonth || parseInt(lastResetMonth) !== currentMonth) {
        // Reset monthly totals
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_MONTH, currentMonth.toString());
        console.log('Monthly ticket totals reset');
      }
    } catch (error) {
      console.error('Failed to check monthly reset:', error);
    }
  }, []);

  const saveTickets = useCallback(async (newTickets: Ticket[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(newTickets));
      setTickets(newTickets);
    } catch (error) {
      console.error('Failed to save tickets:', error);
    }
  }, []);

  const saveAccountBalance = useCallback(async (newBalance: AccountBalance) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNT_BALANCE, JSON.stringify(newBalance));
      setAccountBalance(newBalance);
    } catch (error) {
      console.error('Failed to save account balance:', error);
    }
  }, []);

  const assignTechSupport = useCallback((supportType: SupportType): string => {
    const itTechs = ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Emily Davis'];
    const cyberTechs = ['David Kim', 'Lisa Wang', 'James Wilson', 'Maria Garcia'];
    
    const techs = supportType === 'it' ? itTechs : cyberTechs;
    return techs[Math.floor(Math.random() * techs.length)];
  }, []);

  const createTicket = useCallback(async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Ticket> => {
    const now = new Date().toISOString();
    const ticketId = 'TKT-' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
    
    // Assign tech support and determine initial status
    const assignedTech = assignTechSupport(ticketData.supportType);
    const initialStatus: TicketStatus = 'pending'; // All new tickets start as pending
    
    const newTicket: Ticket = {
      ...ticketData,
      id: ticketId,
      status: initialStatus,
      assignedTo: assignedTech,
      createdAt: now,
      updatedAt: now
    };

    const updatedTickets = [...tickets, newTicket];
    await saveTickets(updatedTickets);
    
    // Update account balance - deduct one ticket
    const newBalance = {
      ...accountBalance,
      usedTickets: accountBalance.usedTickets + 1
    };
    await saveAccountBalance(newBalance);
    
    console.log('Ticket created:', newTicket);
    return newTicket;
  }, [tickets, accountBalance, assignTechSupport, saveTickets, saveAccountBalance]);

  const updateTicketStatus = useCallback(async (ticketId: string, status: TicketStatus) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    });
    
    await saveTickets(updatedTickets);
    console.log(`Ticket ${ticketId} status updated to ${status}`);
  }, [tickets, saveTickets]);

  const getTicketById = useCallback((id: string): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  }, [tickets]);

  const getTicketsByStatus = useCallback((status: TicketStatus): Ticket[] => {
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  const addCredits = useCallback(async (amount: number) => {
    const newBalance = {
      ...accountBalance,
      balance: accountBalance.balance + amount,
      totalTickets: accountBalance.totalTickets + Math.floor(amount / 10) // $10 per ticket
    };
    await saveAccountBalance(newBalance);
    console.log(`Added $${amount} credits, ${Math.floor(amount / 10)} tickets`);
  }, [accountBalance, saveAccountBalance]);

  const refreshStats = useCallback(() => {
    // Force re-calculation of stats
    setTickets([...tickets]);
  }, [tickets]);

  // Calculate ticket statistics
  const ticketStats = useMemo((): TicketStats => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      return ticketDate.getMonth() === currentMonth && ticketDate.getFullYear() === currentYear;
    });
    
    return {
      open: tickets.filter(t => t.status === 'open').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      pending: tickets.filter(t => t.status === 'pending').length,
      total: tickets.length,
      monthlyTotal: monthlyTickets.length
    };
  }, [tickets]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return useMemo(() => ({
    tickets,
    ticketStats,
    accountBalance,
    isLoading,
    createTicket,
    updateTicketStatus,
    getTicketById,
    getTicketsByStatus,
    addCredits,
    refreshStats
  }), [tickets, ticketStats, accountBalance, isLoading, createTicket, updateTicketStatus, getTicketById, getTicketsByStatus, addCredits, refreshStats]);
});