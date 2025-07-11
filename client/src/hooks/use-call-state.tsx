import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Call } from '@shared/schema';

interface CallState {
  activeCall: Call | null;
  dialedNumber: string;
  isInCall: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  callDuration: number;
  incomingCall: {
    callId: string;
    fromNumber: string;
    toNumber: string;
    name?: string;
  } | null;
}

export function useCallState(userId: number = 1) {
  const [state, setState] = useState<CallState>({
    activeCall: null,
    dialedNumber: '',
    isInCall: false,
    isMuted: false,
    isOnHold: false,
    callDuration: 0,
    incomingCall: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateState = useCallback((updates: Partial<CallState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Call initiation mutation
  const initiateCallMutation = useMutation({
    mutationFn: async (data: { fromNumber: string; toNumber: string }) => {
      const response = await apiRequest('POST', '/api/calls', {
        userId,
        callId: `call_${Date.now()}`,
        direction: 'outbound',
        fromNumber: data.fromNumber,
        toNumber: data.toNumber,
        status: 'ringing',
      });
      return response.json();
    },
    onSuccess: (call: Call) => {
      updateState({ 
        activeCall: call, 
        isInCall: true,
        callDuration: 0
      });
      toast({
        title: "Call Initiated",
        description: `Calling ${call.toNumber}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls', userId] });
    },
    onError: (error) => {
      toast({
        title: "Call Failed",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      });
      console.error('Call initiation failed:', error);
    },
  });

  // Call hangup mutation
  const hangupCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const response = await apiRequest('POST', `/api/calls/${callId}/hangup`);
      return response.json();
    },
    onSuccess: () => {
      updateState({ 
        activeCall: null, 
        isInCall: false,
        isMuted: false,
        isOnHold: false,
        callDuration: 0
      });
      toast({
        title: "Call Ended",
        description: "Call has been terminated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls', userId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to end call.",
        variant: "destructive",
      });
      console.error('Call hangup failed:', error);
    },
  });

  // Call answer mutation
  const answerCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const response = await apiRequest('POST', `/api/calls/${callId}/answer`);
      return response.json();
    },
    onSuccess: (call: Call) => {
      updateState({ 
        activeCall: call, 
        isInCall: true,
        incomingCall: null,
        callDuration: 0
      });
      toast({
        title: "Call Answered",
        description: "Call connected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls', userId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to answer call.",
        variant: "destructive",
      });
      console.error('Call answer failed:', error);
    },
  });

  // Hold toggle mutation
  const holdToggleMutation = useMutation({
    mutationFn: async (data: { callId: string; hold: boolean }) => {
      const response = await apiRequest('POST', `/api/calls/${data.callId}/hold`, {
        hold: data.hold
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      updateState({ isOnHold: variables.hold });
      toast({
        title: variables.hold ? "Call On Hold" : "Call Resumed",
        description: variables.hold ? "Call has been put on hold." : "Call has been resumed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to change hold status.",
        variant: "destructive",
      });
      console.error('Hold toggle failed:', error);
    },
  });

  // Mute toggle mutation
  const muteToggleMutation = useMutation({
    mutationFn: async (data: { callId: string; mute: boolean }) => {
      const response = await apiRequest('POST', `/api/calls/${data.callId}/mute`, {
        mute: data.mute
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      updateState({ isMuted: variables.mute });
      toast({
        title: variables.mute ? "Call Muted" : "Call Unmuted",
        description: variables.mute ? "Microphone has been muted." : "Microphone has been unmuted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to change mute status.",
        variant: "destructive",
      });
      console.error('Mute toggle failed:', error);
    },
  });

  // Transfer mutation
  const transferCallMutation = useMutation({
    mutationFn: async (data: { callId: string; toNumber: string }) => {
      const response = await apiRequest('POST', `/api/calls/${data.callId}/transfer`, {
        toNumber: data.toNumber
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Call Transferred",
        description: `Call transferred to ${variables.toNumber}`,
      });
      updateState({ 
        activeCall: null, 
        isInCall: false,
        isMuted: false,
        isOnHold: false
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls', userId] });
    },
    onError: (error) => {
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer call.",
        variant: "destructive",
      });
      console.error('Call transfer failed:', error);
    },
  });

  // Helper functions
  const appendDigit = useCallback((digit: string) => {
    updateState({ dialedNumber: state.dialedNumber + digit });
  }, [state.dialedNumber]);

  const deleteLastDigit = useCallback(() => {
    updateState({ dialedNumber: state.dialedNumber.slice(0, -1) });
  }, [state.dialedNumber]);

  const clearDialedNumber = useCallback(() => {
    updateState({ dialedNumber: '' });
  }, []);

  const setIncomingCall = useCallback((call: CallState['incomingCall']) => {
    updateState({ incomingCall: call });
  }, []);

  const setCallDuration = useCallback((duration: number) => {
    updateState({ callDuration: duration });
  }, []);

  // Actions
  const initiateCall = useCallback((fromNumber: string, toNumber?: string) => {
    const numberToCall = toNumber || state.dialedNumber;
    if (!numberToCall) {
      toast({
        title: "No Number",
        description: "Please enter a phone number to call.",
        variant: "destructive",
      });
      return;
    }
    initiateCallMutation.mutate({ fromNumber, toNumber: numberToCall });
  }, [state.dialedNumber, initiateCallMutation, toast]);

  const hangupCall = useCallback(() => {
    if (state.activeCall) {
      hangupCallMutation.mutate(state.activeCall.callId);
    }
  }, [state.activeCall, hangupCallMutation]);

  const answerCall = useCallback(() => {
    if (state.incomingCall) {
      answerCallMutation.mutate(state.incomingCall.callId);
    }
  }, [state.incomingCall, answerCallMutation]);

  const declineCall = useCallback(() => {
    if (state.incomingCall) {
      hangupCallMutation.mutate(state.incomingCall.callId);
      updateState({ incomingCall: null });
    }
  }, [state.incomingCall, hangupCallMutation]);

  const toggleHold = useCallback(() => {
    if (state.activeCall) {
      holdToggleMutation.mutate({
        callId: state.activeCall.callId,
        hold: !state.isOnHold
      });
    }
  }, [state.activeCall, state.isOnHold, holdToggleMutation]);

  const toggleMute = useCallback(() => {
    if (state.activeCall) {
      muteToggleMutation.mutate({
        callId: state.activeCall.callId,
        mute: !state.isMuted
      });
    }
  }, [state.activeCall, state.isMuted, muteToggleMutation]);

  const transferCall = useCallback((toNumber: string) => {
    if (state.activeCall) {
      transferCallMutation.mutate({
        callId: state.activeCall.callId,
        toNumber
      });
    }
  }, [state.activeCall, transferCallMutation]);

  return {
    ...state,
    appendDigit,
    deleteLastDigit,
    clearDialedNumber,
    setIncomingCall,
    setCallDuration,
    initiateCall,
    hangupCall,
    answerCall,
    declineCall,
    toggleHold,
    toggleMute,
    transferCall,
    isLoading: initiateCallMutation.isPending || hangupCallMutation.isPending || answerCallMutation.isPending,
  };
}
