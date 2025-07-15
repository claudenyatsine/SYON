import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Paperclip, SendHorizonal, Search } from 'lucide-react';

const contacts = [
  { name: 'Dr. Evelyn Reed', subject: 'Physics Tutor', avatar: 'https://placehold.co/100x100.png', online: true },
  { name: 'Mr. John Carter', subject: 'History Tutor', avatar: 'https://placehold.co/100x100.png', online: false },
  { name: 'Ms. Anya Sharma', subject: 'Mathematics Tutor', avatar: 'https://placehold.co/100x100.png', online: true },
];

const messages = [
    { sender: 'other', text: 'Hi Alex, how are you finding the chapter on thermodynamics?' },
    { sender: 'me', text: 'It\'s going well! I had a quick question about the First Law.' },
    { sender: 'other', text: 'Of course, ask away! I\'m here to help.' },
];

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Directly message your tutors and peers.</p>
      </div>
      <div className="grid h-full grid-cols-1 rounded-lg border md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col border-r md:col-span-1">
          <div className="p-4 border-b">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-10" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {contacts.map((contact) => (
                <div key={contact.name} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted bg-secondary">
                  <Avatar className="relative h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    {contact.online && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex flex-col md:col-span-2 lg:col-span-3">
            <div className="p-4 border-b flex items-center gap-3">
                 <Avatar className="relative h-10 w-10">
                    <AvatarImage src={contacts[0].avatar} alt={contacts[0].name} />
                    <AvatarFallback>{contacts[0].name.charAt(0)}</AvatarFallback>
                    {contacts[0].online && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{contacts[0].name}</p>
                    <p className="text-sm text-muted-foreground">{contacts[0].online ? "Online" : "Offline"}</p>
                  </div>
            </div>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-end gap-2", message.sender === 'me' ? 'justify-end' : '')}>
                        {message.sender === 'other' && <Avatar className="h-8 w-8"><AvatarImage src={contacts[0].avatar} /></Avatar>}
                        <div className={cn("max-w-xs lg:max-w-md rounded-lg p-3 text-sm", message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
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
      </div>
    </div>
  );
}
