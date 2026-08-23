import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Basic",
        price: "$99.99/mo",
        description: "For small teams just getting started.",
        features: [
            "Up to 25 Tutors",
            "Up to 1000 Students",
            "Basic Analytics",
            "Community Support"
        ],
        isCurrent: false,
    },
    {
        name: "Pro",
        price: "$299.99/mo",
        description: "For growing schools that need more power.",
        features: [
            "Up to 50 Tutors",
            "Up to 5000 Students",
            "Advanced Analytics",
            "AI-Powered Tools",
            "Priority Support"
        ],
        isCurrent: true,
    },
    {
        name: "Enterprise",
        price: "Contact Us",
        description: "For large institutions with custom needs.",
        features: [
            "Unlimited Tutors & Students",
            "Custom Integrations",
            "Dedicated Account Manager",
            "Single Sign-On (SSO)",
            "24/7 Premium Support"
        ],
        isCurrent: false,
    }
]

function CurrentPlanCard() {
    const currentPlan = plans.find(p => p.isCurrent);
    if (!currentPlan) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>This is the current active subscription for Dr Max online school.</CardDescription>
            </CardHeader>
            <CardContent>
                <Card className="bg-secondary/50 border-border">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-bold">{currentPlan.name} Plan</h3>
                                <Badge variant="default" className="bg-gold/10 text-gold border-gold">Active</Badge>
                            </div>
                            <div className="mt-4 flex items-center gap-4">
                                <Button>Update Payment Method</Button>
                                <Button variant="outline">Cancel Subscription</Button>
                            </div>
                        </div>
                         <div className="text-right">
                            <p className="text-4xl font-bold">{currentPlan.price}</p>
                            <p className="text-sm text-muted-foreground">Next billing on 2024-08-15</p>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}

function AvailablePlans() {
    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Available Plans</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
                {plans.map(plan => (
                    <Card key={plan.name} className={`flex flex-col ${plan.isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                             <p className="text-3xl font-bold pt-2">{plan.price}</p>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                           <ul className="space-y-3">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <Check className="h-5 w-5 text-gold mr-2 shrink-0 mt-0.5" />
                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                           </ul>
                        </CardContent>
                        <CardContent>
                             <Button className="w-full" disabled={plan.isCurrent}>
                                {plan.isCurrent ? 'Current Plan' : 'Upgrade'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function BillingPage() {
    return (
        <div className="p-4 sm:p-6 space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
                <p className="text-muted-foreground">Manage your school's subscription plan and payment details.</p>
            </div>
            <CurrentPlanCard />
            <AvailablePlans />
        </div>
    );
}
