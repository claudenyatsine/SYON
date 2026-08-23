'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

const calendarLegend = [
    { subject: "Mathematics", color: "bg-gold" },
    { subject: "Physics", color: "bg-gold" },
    { subject: "History", color: "bg-gold" },
    { subject: "Chemistry", color: "bg-gold" },
    { subject: "Biology", color: "bg-gold" },
    { subject: "English Literature", color: "bg-gold" },
    { subject: "Computer Science", color: "bg-burgundy" },
]

export function CalendarCard() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
         <Card>
            <CardHeader>
                <CardTitle>Study Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                />
            </CardContent>
             <CardContent>
                <h4 className="font-semibold mb-2 text-sm">Legend</h4>
                <div className="grid grid-cols-2 gap-2">
                    {calendarLegend.map(item => (
                        <div key={item.subject} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-xs text-muted-foreground">{item.subject}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
