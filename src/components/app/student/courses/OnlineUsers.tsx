'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const onlineUsers = [
    { name: "Maren Maureen", avatar: "https://picsum.photos/seed/user-1/40/40", hint: "person portrait" },
    { name: "Jenniffer Jane", avatar: "https://picsum.photos/seed/user-2/40/40", hint: "person portrait" },
    { name: "Ryan Herwinds", avatar: "https://picsum.photos/seed/user-3/40/40", hint: "person portrait" },
    { name: "Kierra Culhane", avatar: "https://picsum.photos/seed/user-4/40/40", hint: "person portrait" },
]

export function OnlineUsers() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Online Users</CardTitle>
                <Button variant="link" size="sm">See all</Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {onlineUsers.map(user => (
                    <div key={user.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.hint} />
                                <AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
