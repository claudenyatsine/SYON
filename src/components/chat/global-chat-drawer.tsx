'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { searchProfilesForChat, getRecentChatContacts, getGlobalChatMessages, sendGlobalChatMessage, markMessagesAsRead } from '@/app/actions/chat';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Send, ArrowLeft, Loader2, User, Plus, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export function GlobalChatDrawer({ trigger }: { trigger: React.ReactNode }) {
  const { profile } = useUser();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Contacts view state
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Active chat state
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load contacts when drawer opens
  useEffect(() => {
    if (isOpen && profile?.id && !activePartnerId) {
      loadContacts();
    }
  }, [isOpen, profile?.id, activePartnerId]);

  async function loadContacts() {
    if (!profile?.id) return;
    setLoadingContacts(true);
    const { data } = await getRecentChatContacts(profile.id);
    if (data) setContacts(data);
    setLoadingContacts(false);
  }

  // Handle Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      const { data } = await searchProfilesForChat(searchQuery);
      if (data) {
        // Exclude self
        setSearchResults(data.filter((p: any) => p.id !== profile?.id));
      }
      setSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, profile?.id]);

  // Load messages when a partner is selected
  useEffect(() => {
    if (activePartnerId && profile?.id) {
      loadMessages();
      markAsRead();
    }
  }, [activePartnerId, profile?.id]);

  async function loadMessages() {
    if (!profile?.id || !activePartnerId) return;
    setLoadingMessages(true);
    const { data } = await getGlobalChatMessages(profile.id, activePartnerId);
    if (data) setMessages(data);
    else setMessages([]);
    setLoadingMessages(false);
  }

  async function markAsRead() {
    if (!profile?.id || !activePartnerId) return;
    await markMessagesAsRead(profile.id, activePartnerId);
    // update contacts list visually
    setContacts(prev => prev.map(c => 
      c.partnerId === activePartnerId ? { ...c, unread: false } : c
    ));
  }

  // Real-time subscription for global messages
  useEffect(() => {
    if (!profile?.id || !isOpen) return;

    const channel = supabase
      .channel(`global_chat_${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'global_messages'
      }, (payload) => {
        const newMsg = payload.new;
        console.log('Realtime payload received in Drawer:', payload);
        // If it's related to the active chat, add it
        if (
          activePartnerId && 
          ((newMsg.sender_id === profile.id && newMsg.receiver_id === activePartnerId) ||
           (newMsg.sender_id === activePartnerId && newMsg.receiver_id === profile.id))
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id === activePartnerId) {
            markAsRead(); // immediately mark read if open
          }
        } else {
          // If it's from someone else, refresh contacts to show new unread
          loadContacts();
        }
      })
      .subscribe((status) => {
        console.log('Drawer Realtime Subscription Status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, isOpen, activePartnerId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !profile?.id || !activePartnerId) return;

    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');
    
    const { data } = await sendGlobalChatMessage(profile.id, activePartnerId, msgText);
    if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      loadContacts(); // Update recent message in list
    }
    setSending(false);
  }

  function handleSelectContact(contact: any) {
    setActivePartnerId(contact.partnerId);
    setActivePartner(contact.profile);
    setSearchQuery('');
  }

  function handleSelectSearchResult(userProfile: any) {
    setActivePartnerId(userProfile.id);
    setActivePartner(userProfile);
    setSearchQuery('');
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card">
        
        {/* --- Contacts List View --- */}
        {!activePartnerId ? (
          <>
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle>Messages</SheetTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search to start a new chat..." 
                  className="pl-9 bg-muted" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </SheetHeader>
            <ScrollArea className="flex-1">
              {searchQuery.trim() ? (
                // Search Results
                <div className="flex flex-col">
                  {searching ? (
                     <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No users found.
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelectSearchResult(user)}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b border-border/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback><User size={16}/></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm truncate">{user.full_name || 'Unknown User'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user.role}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                           <Plus className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Recent Contacts
                loadingContacts ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : contacts.length === 0 ? (
                  <div className="p-8 flex flex-col items-center text-center text-muted-foreground space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 opacity-50" />
                    </div>
                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs max-w-[200px]">Use the search bar above to find someone to chat with!</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {contacts.map((contact) => (
                      <div 
                        key={contact.partnerId}
                        onClick={() => handleSelectContact(contact)}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b border-border/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.profile?.avatar_url} />
                          <AvatarFallback><User size={16}/></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm truncate">{contact.profile?.full_name || 'Unknown User'}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(contact.lastMessageTime), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground truncate pr-2">
                              {contact.lastMessage}
                            </p>
                            {contact.unread && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </ScrollArea>
          </>
        ) : (
          /* --- Active Chat View --- */
          <>
            <SheetHeader className="p-3 border-b border-border flex flex-row items-center space-y-0 gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActivePartnerId(null)}>
                <ArrowLeft size={16} />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={activePartner?.avatar_url} />
                <AvatarFallback><User size={14}/></AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <SheetTitle className="font-medium text-sm leading-none m-0 p-0 text-left">{activePartner?.full_name}</SheetTitle>
                <span className="text-xs text-muted-foreground mt-1 capitalize">{activePartner?.role}</span>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {loadingMessages ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground p-4">Say hello!</div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_id === profile?.id;
                  const isTutor = !isMe && activePartner?.role === 'tutor';
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm border ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-br-sm border-primary/50' 
                          : isTutor 
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37] rounded-bl-sm'
                            : 'bg-muted rounded-bl-sm border-muted-foreground/10'
                      }`}>
                        {msg.message}
                        <div className={`text-[9px] mt-1 text-right opacity-70`}>
                          {format(new Date(msg.created_at), 'h:mm a')}
                          {isMe && <span className="ml-1 text-[10px]">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-border bg-card">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-muted border-0 focus-visible:ring-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
