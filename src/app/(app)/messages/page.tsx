
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ArrowLeft, Paperclip, SendHorizonal, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

const contacts = [
  { name: 'Dr. Evelyn Reed', subject: 'Physics Tutor', avatar: 'https://placehold.co/100x100.png', online: true },
  { name: 'Mr. John Carter', subject: 'History Tutor', avatar: 'https://placehold.co/100x100.png', online: false },
  { name: 'Ms. Anya Sharma', subject: 'Mathematics Tutor', avatar: 'https://placehold.co/100x100.png', online: true },
];

const messages = [
    { sender: 'other', text: 'Hi Alex, how are you finding the chapter on thermodynamics?' },
    { sender: 'me', text: 'It\'s going well! I had a quick question about the First Law.' },
    { sender: 'other', text: 'Of course, ask away! I\'m here to help.' },
    { sender: 'other', text: 'The First Law of Thermodynamics, also known as the Law of Conservation of Energy, states that energy cannot be created or destroyed in an isolated system. It can only be transferred or changed from one form to another. For example, in a car engine, the chemical energy in fuel is converted into mechanical energy to move the car. Make sense?' },
    { sender: 'me', text: 'Yes, that\'s a great explanation. Thank you!' },
];

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Directly message your tutors and peers.</p>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 rounded-lg border min-h-0">
        <div className={cn("flex flex-col border-r md:col-span-1", selectedContact ? 'hidden md:flex' : '')}>
          <div className="p-4 border-b">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-10" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {contacts.map((contact) => (
                <button 
                  key={contact.name} 
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left",
                    selectedContact?.name === contact.name ? 'bg-secondary' : 'hover:bg-muted'
                  )}
                  onClick={() => setSelectedContact(contact)}
                >
                  <Avatar className="relative h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    {contact.online && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
           <div className="p-4 border-t">
            <Button className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </div>
        
        {selectedContact && (
          <div className={cn("flex flex-col md:col-span-2 lg:col-span-3", selectedContact ? 'flex' : 'hidden md:flex')}>
              <div className="p-4 border-b flex items-center gap-3">
                   <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedContact(undefined)}>
                     <ArrowLeft className="h-5 w-5" />
                   </Button>
                   <Avatar className="relative h-10 w-10">
                      <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                      <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                      {selectedContact.online && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />}
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedContact.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedContact.online ? "Online" : "Offline"}</p>
                    </div>
              </div>
            <ScrollArea className="flex-1 p-4 md:p-6 bg-muted/20">
              <div className="space-y-6">
                  {messages.map((message, index) => (
                      <div key={index} className={cn("flex items-end gap-2", message.sender === 'me' ? 'justify-end' : '')}>
                          {message.sender === 'other' && <Avatar className="h-8 w-8 hidden sm:flex"><AvatarImage src={selectedContact.avatar} /></Avatar>}
                          <div className={cn("max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg p-3 text-sm", message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm')}>
                              {message.text}
                          </div>
                      </div>
                  ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
              <div className="relative flex items-center">
                <Input placeholder="Type a message..." className="pr-20" />
                <div className="absolute right-2 flex items-center">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <SendHorizonal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
