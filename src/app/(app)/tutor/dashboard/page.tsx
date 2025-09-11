'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function TutorDashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
        <p className="text-muted-foreground">Manage your courses, students, and schedule.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
             <p className="text-xs text-muted-foreground">+12 since last month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
             <p className="text-xs text-muted-foreground">2 upcoming</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,520</div>
            <p className="text-xs text-muted-foreground">+350 this month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9/5.0</div>
             <p className="text-xs text-muted-foreground">Based on 25 reviews</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Courses</CardTitle>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </div>
          <CardDescription>
            An overview of the courses you are currently teaching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Course management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
